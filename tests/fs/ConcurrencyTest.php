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
        $schema = file_get_contents(__DIR__ . '/../../libraries/fs/persistence/schema/directory_tree.sql');
        $schema = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $schema);
        $db->exec($schema);
        
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
        $schema = file_get_contents(__DIR__ . '/../../libraries/fs/persistence/schema/directory_tree.sql');
        $schema = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $schema);
        $db->exec($schema);
        
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
}