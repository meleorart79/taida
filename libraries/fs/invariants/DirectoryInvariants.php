<?php
namespace Taida\FS\Invariants;

use Taida\FS\DirectoryTree;

class DirectoryInvariants {
    private DirectoryTree $tree;
    
    public function __construct(DirectoryTree $tree) {
        $this->tree = $tree;
    }
    
    /**
     * Check all invariants for a directory
     */
    public function validateDirectory(string $dir_id): array {
        $errors = [];
        $dir = $this->tree->getDirectory($dir_id);
        
        if (!$dir) {
            return ["Directory not found: $dir_id"];
        }
        
        // Invariant 1: Unique names within directory
        $names = [];
        foreach ($dir->entries as $name => $entry) {
            if (isset($names[$name])) {
                $errors[] = "Duplicate name in directory $dir_id: $name";
            }
            $names[$name] = true;
        }
        
        // Invariant 2: All targets exist
        foreach ($dir->entries as $name => $entry) {
            if ($entry->target_type === 'dir') {
                if (!$this->tree->getDirectory($entry->target_id)) {
                    $errors[] = "Entry '$name' points to non-existent directory: {$entry->target_id}";
                }
            } else {
                if (!$this->tree->getFileReference($entry->target_id)) {
                    $errors[] = "Entry '$name' points to non-existent file: {$entry->target_id}";
                }
            }
        }
        
        // Invariant 3: Parent pointer is valid
        if ($dir->parent_id !== null) {
            $parent = $this->tree->getDirectory($dir->parent_id);
            if (!$parent) {
                $errors[] = "Directory $dir_id has invalid parent: {$dir->parent_id}";
            }
        } elseif ($dir->dir_id !== $this->tree->getRootDirId()) {
            $errors[] = "Non-root directory $dir_id has null parent";
        }
        
        return $errors;
    }
    
    /**
     * Check for cycles starting from dir_id
     */
    public function checkForCycles(string $dir_id): ?string {
        $current = $dir_id;
        $visited = [];
        
        while ($current !== null) {
            if (isset($visited[$current])) {
                return "Cycle detected: $current";
            }
            $visited[$current] = true;
            
            $dir = $this->tree->getDirectory($current);
            $current = $dir ? $dir->parent_id : null;
        }
        
        return null; // No cycle
    }
    
    /**
     * Validate entire tree structure
     */
    public function validateTree(): array {
        $all_errors = [];
        
        // Get all directories (would need to add method to DirectoryTree)
        // For now, just validate from root
        $this->validateTreeRecursive($this->tree->getRootDirId(), $all_errors);
        
        return $all_errors;
    }
    
    private function validateTreeRecursive(string $dir_id, array &$errors): void {
        $dir_errors = $this->validateDirectory($dir_id);
        $errors = array_merge($errors, $dir_errors);
        
        $dir = $this->tree->getDirectory($dir_id);
        if ($dir) {
            foreach ($dir->entries as $entry) {
                if ($entry->target_type === 'dir') {
                    $this->validateTreeRecursive($entry->target_id, $errors);
                }
            }
        }
    }
}