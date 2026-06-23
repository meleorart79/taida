<?php
namespace Taida\Tests\FS;

use PHPUnit\Framework\TestCase;
use Taida\FS\DirectoryTree;
use Taida\FS\Persistence\DirectoryTreePersistence;
use Taida\FS\Invariants\DirectoryInvariants;

class InvariantTest extends TestCase {
    private DirectoryTree $tree;
    private DirectoryInvariants $invariants;
    private \PDO $db;
    
    protected function setUp(): void {
        $this->db = new \PDO('sqlite::memory:');
        $this->loadSqliteSchema($this->db);
        
        $persistence = new DirectoryTreePersistence($this->db);
        $this->tree = new DirectoryTree($persistence);
        $this->invariants = new DirectoryInvariants($this->tree);
    }
    
    public function testValidTreeHasNoInvariantViolations(): void {
        $this->tree->createDirectory('/valid');
        $this->tree->createDirectory('/valid/child');
        
        $errors = $this->invariants->validateTree();
        $this->assertEmpty($errors);
    }
    
    public function testDetectsNoCycles(): void {
        $this->tree->createDirectory('/a');
        $this->tree->createDirectory('/a/b');
        $this->tree->createDirectory('/a/b/c');
        
        $dir_c = $this->tree->resolvePath('/a/b/c');
        $cycle_error = $this->invariants->checkForCycles($dir_c['id']);
        
        $this->assertNull($cycle_error);
    }

    private function loadSqliteSchema(\PDO $db): void {
        $schema = file_get_contents(__DIR__ . '/../../libraries/fs/persistence/schema/directory_tree.sql');
        $schema = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $schema);
        $schema = str_replace("ENUM('dir', 'file')", 'VARCHAR(16)', $schema);
        $schema = preg_replace('/\bINT AUTO_INCREMENT PRIMARY KEY\b/', 'INTEGER PRIMARY KEY AUTOINCREMENT', $schema);
        $schema = preg_replace('/^\s*UNIQUE KEY\s+\w+\s+\(([^)]+)\),?\s*$/m', '    UNIQUE ($1),', $schema);
        $schema = preg_replace('/^\s*(FOREIGN KEY|INDEX|KEY)\b.*(?:,)?\R?/m', '', $schema);
        $schema = preg_replace('/,(\s*\))/m', '$1', $schema);
        $schema = preg_replace('/ON DUPLICATE KEY UPDATE[^;]*/m', '', $schema);
        $schema = str_replace('NOW()', "datetime('now')", $schema);

        foreach (array_filter(array_map('trim', explode(';', $schema))) as $stmt) {
            if ($stmt !== '') {
                $db->exec($stmt);
            }
        }
    }
}
