<?php
namespace Taida\FS\Operations;

use Taida\FS\DirectoryTree;
use Taida\FS\Entities\DirectoryEntry;
use Taida\FS\Persistence\DirectoryTreePersistence;

class MoveOperation {
    private DirectoryTree $tree;
    private DirectoryTreePersistence $persistence;
    private CycleDetector $cycleDetector;
    
    public function __construct(
        DirectoryTree $tree,
        DirectoryTreePersistence $persistence,
        CycleDetector $cycleDetector
    ) {
        $this->tree = $tree;
        $this->persistence = $persistence;
        $this->cycleDetector = $cycleDetector;
    }
    
    /**
     * Execute move/rename operation atomically
     * 
     * This is metadata-only - no physical file operations
     */
    public function execute(string $source_path, string $dest_path): bool {
        // Normalize paths
        $source_path = PathResolver::normalizePath($source_path);
        $dest_path = PathResolver::normalizePath($dest_path);
        
        // Cannot move root
        if ($source_path === '/') {
            throw new \RuntimeException("Cannot move root directory");
        }
        
        // Cannot move to same location
        if ($source_path === $dest_path) {
            return true; // No-op
        }
        
        // Resolve source
        $source_result = $this->tree->resolvePath($source_path);
        if (!$source_result) {
            throw new \RuntimeException("Source not found: $source_path");
        }
        
        // Parse paths
        [$source_parent_path, $source_name] = PathResolver::splitPath($source_path);
        [$dest_parent_path, $dest_name] = PathResolver::splitPath($dest_path);
        
        // Validate destination name
        if ($error = PathResolver::validateName($dest_name)) {
            throw new \InvalidArgumentException("Invalid destination name: $error");
        }
        
        // Resolve parents
        $source_parent_result = $this->tree->resolvePath($source_parent_path);
        $dest_parent_result = $this->tree->resolvePath($dest_parent_path);
        
        if (!$source_parent_result || $source_parent_result['type'] !== 'dir') {
            throw new \RuntimeException("Source parent not found: $source_parent_path");
        }
        
        if (!$dest_parent_result || $dest_parent_result['type'] !== 'dir') {
            throw new \RuntimeException("Destination parent not found: $dest_parent_path");
        }
        
        $source_parent_id = $source_parent_result['id'];
        $dest_parent_id = $dest_parent_result['id'];
        
        // If moving directory, check for cycles
        if ($source_result['type'] === 'dir') {
            if ($this->cycleDetector->wouldCreateCycle($source_result['id'], $dest_parent_id)) {
                throw new \RuntimeException("Move would create cycle in directory tree");
            }
        }
        
        // Check destination doesn't already exist
        $dest_parent_dir = $this->tree->getDirectory($dest_parent_id);
        if ($dest_parent_dir->hasEntry($dest_name)) {
            throw new \RuntimeException("Destination already exists: $dest_path");
        }
        
        // Execute transaction
        $this->persistence->beginTransaction();
        try {
            // Remove from source parent
            $source_parent_dir = $this->tree->getDirectory($source_parent_id);
            $entry = $source_parent_dir->removeEntry($source_name);
            $this->persistence->deleteEntry($source_parent_id, $source_name);
            $this->persistence->saveDirectory($source_parent_dir);
            
            // Add to destination parent with new name
            $new_entry = new DirectoryEntry($dest_name, $entry->target_id, $entry->target_type);
            $dest_parent_dir->addEntry($new_entry);
            $this->persistence->saveEntry($dest_parent_id, $new_entry);
            $this->persistence->saveDirectory($dest_parent_dir);
            
            // Update parent pointer if moving directory
            if ($source_result['type'] === 'dir') {
                $moved_dir = $this->tree->getDirectory($source_result['id']);
                $moved_dir->parent_id = $dest_parent_id;
                $this->persistence->saveDirectory($moved_dir);
            }
            
            $this->persistence->commit();
            return true;
            
        } catch (\Exception $e) {
            $this->persistence->rollback();
            throw new \RuntimeException("Move failed: " . $e->getMessage(), 0, $e);
        }
    }
}