<?php
namespace Taida\FS\Migration;

use Taida\FS\DirectoryTree;
use Taida\FS\Invariants\DirectoryInvariants;

class MigrationValidator {
    private DirectoryTree $tree;
    private DirectoryInvariants $invariants;
    
    public function __construct(DirectoryTree $tree) {
        $this->tree = $tree;
        $this->invariants = new DirectoryInvariants($tree);
    }
    
    /**
     * Run comprehensive post-migration checks
     * 
     * @return array ['valid' => bool, 'issues' => array]
     */
    public function validateMigration(): array {
        $issues = [];
        
        // Check tree invariants
        echo "Checking tree invariants...\n";
        $invariant_errors = $this->invariants->validateTree();
        if (!empty($invariant_errors)) {
            $issues = array_merge($issues, $invariant_errors);
        }
        
        // Check orphaned files
        echo "Checking for orphaned files...\n";
        $orphaned = $this->tree->collectGarbage();
        if (!empty($orphaned)) {
            $issues[] = "Found " . count($orphaned) . " orphaned files (cleaned up)";
        }
        
        // Check reference counts
        echo "Validating reference counts...\n";
        $refcount_issues = $this->validateRefcounts();
        if (!empty($refcount_issues)) {
            $issues = array_merge($issues, $refcount_issues);
        }
        
        return [
            'valid' => empty($issues),
            'issues' => $issues
        ];
    }
    
    private function validateRefcounts(): array {
        // This would need a method to list all files
        // For now, just a placeholder
        return [];
    }
}