<?php
namespace Taida\FS\Persistence;

use Taida\FS\Entities\Directory;
use Taida\FS\Entities\DirectoryEntry;
use Taida\FS\Entities\FileReference;

class DirectoryTreePersistence {
    private \PDO $db;
    
    public function __construct(\PDO $db) {
        $this->db = $db;
        $this->db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    }
    
    // ============ DIRECTORY OPERATIONS ============
    
    public function saveDirectory(Directory $dir): bool {
        $stmt = $this->db->prepare("
            INSERT INTO fs_directories (dir_id, parent_id, created_at, modified_at)
            VALUES (:dir_id, :parent_id, :created, :modified)
            ON DUPLICATE KEY UPDATE 
                parent_id = :parent_id,
                modified_at = :modified
        ");
        
        return $stmt->execute([
            ':dir_id' => $dir->dir_id,
            ':parent_id' => $dir->parent_id,
            ':created' => $dir->created_at->format('Y-m-d H:i:s'),
            ':modified' => $dir->modified_at->format('Y-m-d H:i:s')
        ]);
    }
    
    public function loadDirectory(string $dir_id): ?Directory {
        $stmt = $this->db->prepare("
            SELECT dir_id, parent_id, created_at, modified_at
            FROM fs_directories
            WHERE dir_id = :dir_id
        ");
        $stmt->execute([':dir_id' => $dir_id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        $dir = new Directory($row['dir_id'], $row['parent_id']);
        $dir->created_at = new \DateTime($row['created_at']);
        $dir->modified_at = new \DateTime($row['modified_at']);
        
        // Load entries
        $dir->entries = $this->loadEntriesForDirectory($dir_id);
        
        return $dir;
    }
    
    public function deleteDirectory(string $dir_id): bool {
        $stmt = $this->db->prepare("DELETE FROM fs_directories WHERE dir_id = :dir_id");
        return $stmt->execute([':dir_id' => $dir_id]);
    }
    
    // ============ ENTRY OPERATIONS ============
    
    private function loadEntriesForDirectory(string $dir_id): array {
        $stmt = $this->db->prepare("
            SELECT name, target_id, target_type, created_at
            FROM fs_directory_entries
            WHERE parent_id = :parent_id
            ORDER BY name
        ");
        $stmt->execute([':parent_id' => $dir_id]);
        
        $entries = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $entry = new DirectoryEntry(
                $row['name'],
                $row['target_id'],
                $row['target_type']
            );
            $entry->created_at = new \DateTime($row['created_at']);
            $entries[$row['name']] = $entry;
        }
        
        return $entries;
    }
    
    public function saveEntry(string $parent_id, DirectoryEntry $entry): bool {
        $stmt = $this->db->prepare("
            INSERT INTO fs_directory_entries (parent_id, name, target_id, target_type, created_at)
            VALUES (:parent_id, :name, :target_id, :target_type, :created)
            ON DUPLICATE KEY UPDATE
                target_id = :target_id,
                target_type = :target_type
        ");
        
        return $stmt->execute([
            ':parent_id' => $parent_id,
            ':name' => $entry->name,
            ':target_id' => $entry->target_id,
            ':target_type' => $entry->target_type,
            ':created' => $entry->created_at->format('Y-m-d H:i:s')
        ]);
    }
    
    public function deleteEntry(string $parent_id, string $name): bool {
        $stmt = $this->db->prepare("
            DELETE FROM fs_directory_entries
            WHERE parent_id = :parent_id AND name = :name
        ");
        return $stmt->execute([
            ':parent_id' => $parent_id,
            ':name' => $name
        ]);
    }
    
    // ============ FILE REFERENCE OPERATIONS ============
    
    public function saveFileReference(FileReference $file): bool {
        $stmt = $this->db->prepare("
            INSERT INTO fs_file_references 
            (file_id, refcount, storage_path, created_at, size_bytes, mime_type)
            VALUES (:file_id, :refcount, :storage_path, :created, :size, :mime)
            ON DUPLICATE KEY UPDATE
                refcount = :refcount,
                size_bytes = :size,
                mime_type = :mime
        ");
        
        return $stmt->execute([
            ':file_id' => $file->file_id,
            ':refcount' => $file->refcount,
            ':storage_path' => $file->storage_path,
            ':created' => $file->created_at->format('Y-m-d H:i:s'),
            ':size' => $file->size_bytes,
            ':mime' => $file->mime_type
        ]);
    }
    
    public function loadFileReference(string $file_id): ?FileReference {
        $stmt = $this->db->prepare("
            SELECT file_id, refcount, storage_path, created_at, size_bytes, mime_type
            FROM fs_file_references
            WHERE file_id = :file_id
        ");
        $stmt->execute([':file_id' => $file_id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        $file = new FileReference($row['file_id'], $row['storage_path']);
        $file->refcount = (int)$row['refcount'];
        $file->created_at = new \DateTime($row['created_at']);
        $file->size_bytes = (int)$row['size_bytes'];
        $file->mime_type = $row['mime_type'];
        
        return $file;
    }
    
    public function getOrphanedFiles(): array {
        $stmt = $this->db->query("
            SELECT file_id FROM fs_file_references WHERE refcount = 0
        ");
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }
    
    public function deleteFileReference(string $file_id): bool {
        $stmt = $this->db->prepare("DELETE FROM fs_file_references WHERE file_id = :file_id");
        return $stmt->execute([':file_id' => $file_id]);
    }
    
    // ============ TRANSACTION SUPPORT ============
    
    public function beginTransaction(): bool {
        return $this->db->beginTransaction();
    }
    
    public function commit(): bool {
        return $this->db->commit();
    }
    
    public function rollback(): bool {
        return $this->db->rollBack();
    }
}