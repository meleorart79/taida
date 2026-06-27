<?php
namespace Taida\FS;

use Taida\FS\Entities\Directory;
use Taida\FS\Entities\DirectoryEntry;
use Taida\FS\Entities\FileReference;
use Taida\FS\Persistence\DirectoryTreePersistence;
use Taida\FS\Operations\PathResolver;
use Taida\FS\Operations\MoveOperation;
use Taida\FS\Operations\CycleDetector;
use Taida\FS\Invariants\DirectoryInvariants;

class DirectoryTree {
    private DirectoryTreePersistence $persistence;
    private CycleDetector $cycleDetector;
    private DirectoryInvariants $invariants;
    private MoveOperation $moveOperation;
    
    private string $root_dir_id = 'ROOT';
    private bool $debug_mode = false;
    
    // In-memory cache (optional optimization)
    private array $directoryCache = [];
    private array $fileCache = [];
    
    public function __construct(DirectoryTreePersistence $persistence) {
        $this->persistence = $persistence;
        $this->cycleDetector = new CycleDetector($this);
        $this->invariants = new DirectoryInvariants($this);
        $this->moveOperation = new MoveOperation($this, $this->persistence, $this->cycleDetector);
    }
    
    // ============ PUBLIC API ============
    
    /**
     * Resolve path to target ID and type
     * 
     * @param string $path Absolute path (e.g., '/users/alice/docs')
     * @return array|null ['type' => 'dir'|'file', 'id' => string] or null if not found
     */
    public function resolvePath(string $path): ?array {
        $this->debugLog("resolvePath", ['path' => $path]);
        
        $path = PathResolver::normalizePath($path);
        
        if (!PathResolver::checkDepth($path)) {
            throw new \RuntimeException("Path exceeds maximum depth: $path");
        }
        
        // Root special case
        if ($path === '/') {
            return ['type' => 'dir', 'id' => $this->root_dir_id];
        }
        
        // Split into segments and traverse
        $segments = array_filter(explode('/', trim($path, '/')));
        $current_dir_id = $this->root_dir_id;
        
        foreach ($segments as $idx => $segment) {
            $dir = $this->getDirectory($current_dir_id);
            if (!$dir) {
                $this->debugLog("resolvePath: directory not found", ['dir_id' => $current_dir_id]);
                return null;
            }
            
            $entry = $dir->getEntry($segment);
            if (!$entry) {
                $this->debugLog("resolvePath: entry not found", [
                    'dir_id' => $current_dir_id,
                    'segment' => $segment
                ]);
                return null;
            }
            
            // If this is the last segment, return the target
            if ($idx === count($segments) - 1) {
                return [
                    'type' => $entry->target_type,
                    'id' => $entry->target_id
                ];
            }
            
            // Otherwise, must be a directory to continue
            if ($entry->target_type !== 'dir') {
                $this->debugLog("resolvePath: path component is not a directory", [
                    'segment' => $segment,
                    'type' => $entry->target_type
                ]);
                return null;
            }
            
            $current_dir_id = $entry->target_id;
        }
        
        return null;
    }
    
    /**
     * Create new directory
     * 
     * @param string $path Absolute path for new directory
     * @return string The new dir_id
     * @throws \RuntimeException If parent doesn't exist or name already taken
     */
    public function createDirectory(string $path): string {
        $this->debugLog("createDirectory", ['path' => $path]);
        
        [$parent_path, $name] = PathResolver::splitPath($path);
        
        // Validate name
        if ($error = PathResolver::validateName($name)) {
            throw new \InvalidArgumentException($error);
        }
        
        // Resolve parent
        $parent_result = $this->resolvePath($parent_path);
        if (!$parent_result || $parent_result['type'] !== 'dir') {
            throw new \RuntimeException("Parent directory not found: $parent_path");
        }
        
        $parent_id = $parent_result['id'];
        $parent_dir = $this->getDirectory($parent_id);
        
        // Check uniqueness
        if ($parent_dir->hasEntry($name)) {
            throw new \RuntimeException("Entry already exists: $path");
        }
        
        $this->persistence->beginTransaction();
        try {
            // Create new directory
            $new_dir_id = $this->generateDirId();
            $new_dir = new Directory($new_dir_id, $parent_id);
            $this->persistence->saveDirectory($new_dir);
            
            // Add entry in parent
            $entry = new DirectoryEntry($name, $new_dir_id, 'dir');
            $parent_dir->addEntry($entry);
            $this->persistence->saveEntry($parent_id, $entry);
            $this->persistence->saveDirectory($parent_dir);
            
            $this->persistence->commit();
            
            // Update cache
            $this->directoryCache[$new_dir_id] = $new_dir;
            
            $this->debugLog("createDirectory: success", ['dir_id' => $new_dir_id, 'path' => $path]);
            return $new_dir_id;
            
        } catch (\Exception $e) {
            $this->persistence->rollback();
            $this->debugLog("createDirectory: failed", ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    
    /**
     * Remove directory (must be empty)
     * 
     * @param string $path Absolute path to directory
     * @return bool True on success
     * @throws \RuntimeException If not empty or doesn't exist
     */
    public function removeDirectory(string $path): bool {
        $this->debugLog("removeDirectory", ['path' => $path]);
        
        $result = $this->resolvePath($path);
        if (!$result || $result['type'] !== 'dir') {
            throw new \RuntimeException("Directory not found: $path");
        }
        
        $dir_id = $result['id'];
        
        // Cannot remove root
        if ($dir_id === $this->root_dir_id) {
            throw new \RuntimeException("Cannot remove root directory");
        }
        
        $dir = $this->getDirectory($dir_id);
        
        // Check if empty (only hidden dot-files allowed, per spec)
        foreach ($dir->entries as $name => $entry) {
            if (substr($name, 0, 1) !== '.') {
                throw new \RuntimeException("Directory not empty: $path");
            }
        }
        
        $this->persistence->beginTransaction();
        try {
            // Remove from parent
            [$parent_path, $name] = PathResolver::splitPath($path);
            $parent_result = $this->resolvePath($parent_path);
            $parent_dir = $this->getDirectory($parent_result['id']);
            
            $parent_dir->removeEntry($name);
            $this->persistence->deleteEntry($parent_result['id'], $name);
            $this->persistence->saveDirectory($parent_dir);
            
            // Delete directory itself
            $this->persistence->deleteDirectory($dir_id);
            
            $this->persistence->commit();
            
            // Update cache
            unset($this->directoryCache[$dir_id]);
            
            $this->debugLog("removeDirectory: success", ['path' => $path]);
            return true;
            
        } catch (\Exception $e) {
            $this->persistence->rollback();
            $this->debugLog("removeDirectory: failed", ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    
    /**
     * List directory contents
     * 
     * @param string $path Absolute path to directory
     * @return array Array of ['name' => string, 'type' => 'dir'|'file', 'id' => string]
     */
    public function listDirectory(string $path): array {
        $result = $this->resolvePath($path);
        if (!$result || $result['type'] !== 'dir') {
            throw new \RuntimeException("Directory not found: $path");
        }
        
        $dir = $this->getDirectory($result['id']);
        $entries = [];
        
        foreach ($dir->entries as $name => $entry) {
            $entries[] = [
                'name' => $name,
                'type' => $entry->target_type,
                'id' => $entry->target_id
            ];
        }
        
        return $entries;
    }
    
    /**
     * Add file entry (create hard link)
     * 
     * @param string $path Absolute path for new file entry
     * @param string $file_id Existing file_id to link to
     * @return bool True on success
     */
    public function addFileEntry(string $path, string $file_id): bool {
        $this->debugLog("addFileEntry", ['path' => $path, 'file_id' => $file_id]);
        
        [$parent_path, $name] = PathResolver::splitPath($path);
        
        // Validate name
        if ($error = PathResolver::validateName($name)) {
            throw new \InvalidArgumentException($error);
        }
        
        // Resolve parent
        $parent_result = $this->resolvePath($parent_path);
        if (!$parent_result || $parent_result['type'] !== 'dir') {
            throw new \RuntimeException("Parent directory not found: $parent_path");
        }
        
        $parent_id = $parent_result['id'];
        $parent_dir = $this->getDirectory($parent_id);
        
        // Check uniqueness
        if ($parent_dir->hasEntry($name)) {
            throw new \RuntimeException("Entry already exists: $path");
        }
        
        // Check file exists
        $file_ref = $this->getFileReference($file_id);
        if (!$file_ref) {
            throw new \RuntimeException("File not found: $file_id");
        }
        
        $this->persistence->beginTransaction();
        try {
            // Add entry
            $entry = new DirectoryEntry($name, $file_id, 'file');
            $parent_dir->addEntry($entry);
            $this->persistence->saveEntry($parent_id, $entry);
            $this->persistence->saveDirectory($parent_dir);
            
            // Increment refcount
            $file_ref->incrementRefcount();
            $this->persistence->saveFileReference($file_ref);
            
            $this->persistence->commit();
            
            $this->debugLog("addFileEntry: success", [
                'path' => $path,
                'refcount' => $file_ref->refcount
            ]);
            return true;
            
        } catch (\Exception $e) {
            $this->persistence->rollback();
            $this->debugLog("addFileEntry: failed", ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    
    /**
     * Remove file entry (unlink)
     * 
     * @param string $path Absolute path to file entry
     * @return string The file_id that was unlinked
     */
    public function removeFileEntry(string $path): string {
        $this->debugLog("removeFileEntry", ['path' => $path]);
        
        $result = $this->resolvePath($path);
        if (!$result || $result['type'] !== 'file') {
            throw new \RuntimeException("File not found: $path");
        }
        
        $file_id = $result['id'];
        
        $this->persistence->beginTransaction();
        try {
            // Remove from parent
            [$parent_path, $name] = PathResolver::splitPath($path);
            $parent_result = $this->resolvePath($parent_path);
            $parent_dir = $this->getDirectory($parent_result['id']);
            
            $parent_dir->removeEntry($name);
            $this->persistence->deleteEntry($parent_result['id'], $name);
            $this->persistence->saveDirectory($parent_dir);
            
            // Decrement refcount
            $file_ref = $this->getFileReference($file_id);
            if ($file_ref) {
                $file_ref->decrementRefcount();
                $this->persistence->saveFileReference($file_ref);
                
                $this->debugLog("removeFileEntry: decremented refcount", [
                    'file_id' => $file_id,
                    'refcount' => $file_ref->refcount
                ]);
                
                // Trigger GC if orphaned
                if ($file_ref->isOrphaned()) {
                    $this->emitOrphanedFile($file_id);
                }
            }
            
            $this->persistence->commit();
            return $file_id;
            
        } catch (\Exception $e) {
            $this->persistence->rollback();
            $this->debugLog("removeFileEntry: failed", ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    
    /**
     * Create new file reference in system
     * 
     * @param string $storage_path Physical path where file is stored
     * @return string New file_id
     */
    public function createFileReference(string $storage_path): string {
        $this->debugLog("createFileReference", ['storage_path' => $storage_path]);
        
        $file_id = $this->generateFileId();
        $file_ref = new FileReference($file_id, $storage_path);
        
        // Get file info
        if (file_exists($storage_path)) {
            $file_ref->size_bytes = filesize($storage_path);
            $file_ref->mime_type = mime_content_type($storage_path) ?: null;
        }
        
        $this->persistence->saveFileReference($file_ref);
        $this->fileCache[$file_id] = $file_ref;
        
        $this->debugLog("createFileReference: success", ['file_id' => $file_id]);
        return $file_id;
    }
    
    /**
     * Move/rename entry atomically
     * 
     * @param string $source_path Current path
     * @param string $dest_path Destination path
     * @return bool True on success
     */
    public function move(string $source_path, string $dest_path): bool {
        $this->debugLog("move", ['source' => $source_path, 'dest' => $dest_path]);
        return $this->moveOperation->execute($source_path, $dest_path);
    }
    
    /**
     * Run garbage collection on orphaned files
     * 
     * @return array Array of deleted file_ids
     */
    public function collectGarbage(): array {
        $this->debugLog("collectGarbage: starting");
        
        $orphaned = $this->persistence->getOrphanedFiles();
        $deleted = [];
        
        foreach ($orphaned as $file_id) {
            $file_ref = $this->getFileReference($file_id);
            if ($file_ref && $file_ref->isOrphaned()) {
                // Delete physical file
                if (file_exists($file_ref->storage_path)) {
                    @unlink($file_ref->storage_path);
                    $this->debugLog("collectGarbage: deleted physical file", [
                        'file_id' => $file_id,
                        'path' => $file_ref->storage_path
                    ]);
                }
                
                // Delete metadata
                $this->persistence->deleteFileReference($file_id);
                unset($this->fileCache[$file_id]);
                
                $deleted[] = $file_id;
            }
        }
        
        $this->debugLog("collectGarbage: completed", ['deleted_count' => count($deleted)]);
        return $deleted;
    }
    
    // ============ INTERNAL METHODS ============
    
    public function getDirectory(string $dir_id): ?Directory {
        // Check cache first
        if (isset($this->directoryCache[$dir_id])) {
            return $this->directoryCache[$dir_id];
        }
        
        $dir = $this->persistence->loadDirectory($dir_id);
        if ($dir) {
            $this->directoryCache[$dir_id] = $dir;
        }
        
        return $dir;
    }
    
    public function getFileReference(string $file_id): ?FileReference {
        if (isset($this->fileCache[$file_id])) {
            return $this->fileCache[$file_id];
        }
        
        $file = $this->persistence->loadFileReference($file_id);
        if ($file) {
            $this->fileCache[$file_id] = $file;
        }
        
        return $file;
    }
    
    private function emitOrphanedFile(string $file_id): void {
        error_log("[DirectoryTree] File orphaned, ready for GC: $file_id");
        // Could publish to message queue for async GC
    }
    
    private function generateDirId(): string {
        return 'd_' . bin2hex(random_bytes(16));
    }
    
    private function generateFileId(): string {
        return 'f_' . bin2hex(random_bytes(16));
    }
    
    public function getRootDirId(): string {
        return $this->root_dir_id;
    }
    
    public function setDebugMode(bool $enabled): void {
        $this->debug_mode = $enabled;
    }
    
    private function debugLog(string $message, array $context = []): void {
        if ($this->debug_mode) {
            error_log("[DirectoryTree] $message " . json_encode($context));
        }
    }
    
    public function clearCache(): void {
        $this->directoryCache = [];
        $this->fileCache = [];
    }
}
