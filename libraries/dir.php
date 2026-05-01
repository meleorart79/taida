<?php
/**
 * Directory operations wrapper
 * NOW: Thin layer over DirectoryTree
 */

require_once BASE_PATH . '/libraries/taida_backend.php';
require_once BASE_PATH . '/libraries/fs/DirectoryTree.php';

use Taida\FS\DirectoryTree;
use Taida\FS\Persistence\DirectoryTreePersistence;

class dir extends taida_backend {
    private static ?DirectoryTree $tree = null;
    
    private static function getTree(): DirectoryTree {
        if (self::$tree === null) {
            // Initialize DirectoryTree (using existing DB connection)
            global $db; // Assuming global PDO instance
            $persistence = new DirectoryTreePersistence($db);
            self::$tree = new DirectoryTree($persistence);
        }
        return self::$tree;
    }
    
    /**
     * Create directory
     * OLD: mkdir($path)
     * NEW: DirectoryTree->createDirectory($path)
     */
    public static function mkdir($path) {
        try {
            $tree = self::getTree();
            $dir_id = $tree->createDirectory($path);
            return ['success' => true, 'dir_id' => $dir_id];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Remove directory
     * OLD: rmdir($path)
     * NEW: DirectoryTree->removeDirectory($path)
     */
    public static function rmdir($path) {
        try {
            $tree = self::getTree();
            $tree->removeDirectory($path);
            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * List directory contents
     * OLD: Direct filesystem scandir()
     * NEW: DirectoryTree->listDirectory($path)
     */
    public static function listdir($path) {
        try {
            $tree = self::getTree();
            $entries = $tree->listDirectory($path);
            
            // Format for backward compatibility
            $result = [];
            foreach ($entries as $entry) {
                $result[] = [
                    'name' => $entry['name'],
                    'type' => $entry['type'],
                    'path' => $path . '/' . $entry['name']
                ];
            }
            
            return ['success' => true, 'entries' => $result];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Move/rename directory
     * OLD: Physical rename()
     * NEW: DirectoryTree->move() (metadata only)
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
     * Check if directory exists
     */
    public static function exists($path) {
        try {
            $tree = self::getTree();
            $result = $tree->resolvePath($path);
            return $result && $result['type'] === 'dir';
        } catch (\Exception $e) {
            return false;
        }
    }
}