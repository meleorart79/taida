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
        $schema = file_get_contents(__DIR__ . '/../../libraries/fs/persistence/schema/directory_tree.sql');
        $schema = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $schema);
        $this->db->exec($schema);
        
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
}