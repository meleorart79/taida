<?php
namespace Taida\FS\Operations;

use Taida\FS\DirectoryTree;

class CycleDetector {
    private DirectoryTree $tree;
    
    public function __construct(DirectoryTree $tree) {
        $this->tree = $tree;
    }
    
    /**
     * Check if moving dir_id into dest_parent_id would create a cycle
     * 
     * Returns true if cycle detected, false if safe
     */
    public function wouldCreateCycle(string $dir_id, string $dest_parent_id): bool {
        // If moving into itself, that's a cycle
        if ($dir_id === $dest_parent_id) {
            return true;
        }
        
        // Walk up from dest_parent_id to root
        // If we encounter dir_id along the way, it's a cycle
        $current = $dest_parent_id;
        $visited = [];
        
        while ($current !== null) {
            // Cycle in tree structure itself (corruption)
            if (isset($visited[$current])) {
                throw new \RuntimeException("Cycle detected in existing tree structure");
            }
            $visited[$current] = true;
            
            // Found our target in the ancestry - would create cycle
            if ($current === $dir_id) {
                return true;
            }
            
            // Move to parent
            $dir = $this->tree->getDirectory($current);
            $current = $dir ? $dir->parent_id : null;
        }
        
        return false; // No cycle
    }
}