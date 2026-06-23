<?php
namespace Taida\Tests\FS;

use PHPUnit\Framework\TestCase;
use Taida\FS\DirectoryTree;
use Taida\FS\Persistence\DirectoryTreePersistence;

class ConcurrencyTest extends TestCase {
    /**
     * Test that concurrent operations maintain consistency
     * 
     * Note: This test simulates concurrency by rapid sequential operations.
     * For true concurrency testing, use separate processes or threads.
     */
    public function testRapidDirectoryCreation(): void {
        $db = new \PDO('sqlite::memory:');
        $this->loadSqliteSchema($db);
        
        $persistence = new DirectoryTreePersistence($db);
        $tree = new DirectoryTree($persistence);
        
        // Create many directories rapidly
        for ($i = 0; $i < 100; $i++) {
            $tree->createDirectory("/test_$i");
        }
        
        // Verify all were created
        for ($i = 0; $i < 100; $i++) {
            $result = $tree->resolvePath("/test_$i");
            $this->assertNotNull($result);
        }
    }
    
    public function testConcurrentFileOperations(): void {
        $db = new \PDO('sqlite::memory:');
        $this->loadSqliteSchema($db);
        
        $persistence = new DirectoryTreePersistence($db);
        $tree = new DirectoryTree($persistence);
        
        $tree->createDirectory('/files');
        
        // Create multiple hard links to same file rapidly
        $storage_path = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($storage_path, 'shared');
        $file_id = $tree->createFileReference($storage_path);
        
        for ($i = 0; $i < 50; $i++) {
            $tree->addFileEntry("/files/link_$i.txt", $file_id);
        }
        
        // Verify refcount
        $file_ref = $tree->getFileReference($file_id);
        $this->assertEquals(50, $file_ref->refcount);
        
        unlink($storage_path);
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
