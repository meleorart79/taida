<?php
/**
 * File operations wrapper
 * NOW: Thin layer over DirectoryTree
 */

require_once BASE_PATH . '/libraries/taida_backend.php';
require_once BASE_PATH . '/libraries/fs/DirectoryTree.php';

use Taida\FS\DirectoryTree;
use Taida\FS\Persistence\DirectoryTreePersistence;

class file extends taida_backend {
    private static ?DirectoryTree $tree = null;
    
    private static function getTree(): DirectoryTree {
        if (self::$tree === null) {
            global $db;
            $persistence = new DirectoryTreePersistence($db);
            self::$tree = new DirectoryTree($persistence);
        }
        return self::$tree;
    }
    
    /**
     * Upload/create file
     * OLD: Direct file_put_contents() + path storage
     * NEW: Physical storage + DirectoryTree->createFileReference() + addFileEntry()
     */
    public static function upload($path, $physical_file) {
        try {
            $tree = self::getTree();
            
            // Store physical file (using existing storage strategy)
            $storage_path = self::getStoragePath($physical_file);
            if (!move_uploaded_file($physical_file['tmp_name'], $storage_path)) {
                throw new \RuntimeException("Failed to store file");
            }
            
            // Register in DirectoryTree
            $file_id = $tree->createFileReference($storage_path);
            $tree->addFileEntry($path, $file_id);
            
            return ['success' => true, 'file_id' => $file_id];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Delete file
     * OLD: unlink() on physical path
     * NEW: DirectoryTree->removeFileEntry() (decrements refcount, GC handles deletion)
     */
    public static function delete($path) {
        try {
            $tree = self::getTree();
            $file_id = $tree->removeFileEntry($path);
            return ['success' => true, 'file_id' => $file_id];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Create hard link
     * NEW: DirectoryTree->addFileEntry() with existing file_id
     */
    public static function hardlink($source_path, $dest_path) {
        try {
            $tree = self::getTree();
            
            // Resolve source to get file_id
            $result = $tree->resolvePath($source_path);
            if (!$result || $result['type'] !== 'file') {
                throw new \RuntimeException("Source file not found");
            }
            
            // Create new entry pointing to same file_id
            $tree->addFileEntry($dest_path, $result['id']);
            
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Get file info
     */
    public static function info($path) {
        try {
            $tree = self::getTree();
            $result = $tree->resolvePath($path);
            
            if (!$result || $result['type'] !== 'file') {
                throw new \RuntimeException("File not found");
            }
            
            $file_ref = $tree->getFileReference($result['id']);
            
            return [
                'success' => true,
                'file_id' => $file_ref->file_id,
                'size' => $file_ref->size_bytes,
                'mime_type' => $file_ref->mime_type,
                'refcount' => $file_ref->refcount,
                'storage_path' => $file_ref->storage_path
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Move/rename file
     */
    public static function move($source, $dest) {
        try {
            $tree = self::getTree();
            $tree->move($source, $dest);
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Helper: Generate storage path for physical file
     */
    private static function getStoragePath($file): string {
        // Use existing storage strategy (hash-based, date-based, etc.)
        // Example:
        $hash = md5(uniqid() . $file['name']);
        $subdir = substr($hash, 0, 2);
        $storage_root = '/var/www/taida/storage/files';
        
        $dir = "$storage_root/$subdir";
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        return "$dir/$hash";
    }
}