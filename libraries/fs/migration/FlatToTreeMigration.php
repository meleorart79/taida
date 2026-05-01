<?php
namespace Taida\FS\Migration;

use Taida\FS\DirectoryTree;
use Taida\FS\Operations\PathResolver;

class FlatToTreeMigration {
    private DirectoryTree $tree;
    private string $base_path;
    private array $stats = [
        'directories' => 0,
        'files' => 0,
        'errors' => []
    ];
    
    public function __construct(DirectoryTree $tree, string $base_path) {
        $this->tree = $tree;
        $this->base_path = rtrim($base_path, '/');
    }
    
    /**
     * Migrate entire filesystem tree
     * 
     * @param string $physical_root Physical directory to scan
     * @return array Migration statistics
     */
    public function migrate(string $physical_root): array {
        if (!is_dir($physical_root)) {
            throw new \RuntimeException("Physical root does not exist: $physical_root");
        }
        
        echo "Starting migration from: $physical_root\n";
        $this->stats = ['directories' => 0, 'files' => 0, 'errors' => []];
        
        // Start recursive scan from root
        $this->migrateDirectory($physical_root, '/');
        
        return $this->stats;
    }
    
    /**
     * Recursively migrate directory and its contents
     */
    private function migrateDirectory(string $physical_path, string $logical_path): void {
        echo "Processing: $logical_path\n";
        
        $entries = scandir($physical_path);
        if ($entries === false) {
            $this->stats['errors'][] = "Cannot read directory: $physical_path";
            return;
        }
        
        foreach ($entries as $entry) {
            // Skip . and ..
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            
            $entry_physical_path = $physical_path . '/' . $entry;
            $entry_logical_path = $logical_path . ($logical_path === '/' ? '' : '/') . $entry;
            
            try {
                if (is_dir($entry_physical_path)) {
                    // Create directory in tree
                    $this->tree->createDirectory($entry_logical_path);
                    $this->stats['directories']++;
                    
                    // Recurse
                    $this->migrateDirectory($entry_physical_path, $entry_logical_path);
                    
                } elseif (is_file($entry_physical_path)) {
                    // Create file reference
                    $file_id = $this->tree->createFileReference($entry_physical_path);
                    
                    // Add entry in tree
                    $this->tree->addFileEntry($entry_logical_path, $file_id);
                    $this->stats['files']++;
                }
                
            } catch (\Exception $e) {
                $this->stats['errors'][] = [
                    'path' => $entry_logical_path,
                    'error' => $e->getMessage()
                ];
                echo "  ERROR: " . $e->getMessage() . "\n";
            }
        }
    }
    
    /**
     * Verify migration completeness
     * 
     * @return array Validation results
     */
    public function verify(string $physical_root): array {
        $issues = [];
        $this->verifyDirectory($physical_root, '/', $issues);
        return $issues;
    }
    
    private function verifyDirectory(string $physical_path, string $logical_path, array &$issues): void {
        $entries = scandir($physical_path);
        if ($entries === false) {
            $issues[] = "Cannot verify directory: $physical_path";
            return;
        }
        
        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            
            $entry_physical_path = $physical_path . '/' . $entry;
            $entry_logical_path = $logical_path . ($logical_path === '/' ? '' : '/') . $entry;
            
            // Check if exists in tree
            $result = $this->tree->resolvePath($entry_logical_path);
            if (!$result) {
                $issues[] = "Missing in tree: $entry_logical_path";
            }
            
            if (is_dir($entry_physical_path)) {
                $this->verifyDirectory($entry_physical_path, $entry_logical_path, $issues);
            }
        }
    }
    
    /**
     * Generate migration report
     */
    public function getReport(): string {
        $report = "Migration Report\n";
        $report .= "================\n";
        $report .= "Directories: {$this->stats['directories']}\n";
        $report .= "Files: {$this->stats['files']}\n";
        $report .= "Directories created: {$this->stats['directories']}\n";
        $report .= "Files migrated: {$this->stats['files']}\n";
        $report .= "Errors: " . count($this->stats['errors']) . "\n\n";
        
        if (!empty($this->stats['errors'])) {
            $report .= "Error Details:\n";
            foreach ($this->stats['errors'] as $error) {
                if (is_array($error)) {
                    $report .= "  - {$error['path']}: {$error['error']}\n";
                } else {
                    $report .= "  - $error\n";
                }
            }
        }
        
        return $report;
    }
}