<?php
namespace Taida\Tests\FS;

use PHPUnit\Framework\TestCase;
use Taida\FS\DirectoryTree;
use Taida\FS\Persistence\DirectoryTreePersistence;

class DirectoryTreeTest extends TestCase {
    private DirectoryTree $tree;
    private \PDO $db;
    
    protected function setUp(): void {
        // Create in-memory SQLite database
        $this->db = new \PDO('sqlite::memory:');
        
        // Load schema
        $schema = file_get_contents(__DIR__ . '/../../libraries/fs/persistence/schema/directory_tree.sql');
        // Convert MySQL syntax to SQLite if needed
        $schema = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $schema);
        $schema = str_replace('AUTO_INCREMENT', 'AUTOINCREMENT', $schema);
        $this->db->exec($schema);
        
        $persistence = new DirectoryTreePersistence($this->db);
        $this->tree = new DirectoryTree($persistence);
        $this->tree->setDebugMode(true);
    }
    
    protected function tearDown(): void {
        $this->db = null;
        $this->tree = null;
    }
    
    // ===== BASIC OPERATIONS =====
    
    public function testCreateDirectory(): void {
        $dir_id = $this->tree->createDirectory('/test');
        $this->assertNotNull($dir_id);
        $this->assertStringStartsWith('d_', $dir_id);
        
        $result = $this->tree->resolvePath('/test');
        $this->assertEquals('dir', $result['type']);
        $this->assertEquals($dir_id, $result['id']);
    }
    
    public function testCreateNestedDirectory(): void {
        $this->tree->createDirectory('/parent');
        $child_id = $this->tree->createDirectory('/parent/child');
        
        $result = $this->tree->resolvePath('/parent/child');
        $this->assertEquals($child_id, $result['id']);
    }
    
    public function testCannotCreateDuplicateDirectory(): void {
        $this->tree->createDirectory('/test');
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Entry already exists');
        $this->tree->createDirectory('/test');
    }
    
    public function testCannotCreateDirectoryWithInvalidParent(): void {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Parent directory not found');
        $this->tree->createDirectory('/nonexistent/child');
    }
    
    public function testRemoveEmptyDirectory(): void {
        $this->tree->createDirectory('/temp');
        $result = $this->tree->removeDirectory('/temp');
        
        $this->assertTrue($result);
        $this->assertNull($this->tree->resolvePath('/temp'));
    }
    
    public function testCannotRemoveNonEmptyDirectory(): void {
        $this->tree->createDirectory('/parent');
        $this->tree->createDirectory('/parent/child');
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Directory not empty');
        $this->tree->removeDirectory('/parent');
    }
    
    public function testCannotRemoveRootDirectory(): void {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot remove root');
        $this->tree->removeDirectory('/');
    }
    
    // ===== PATH RESOLUTION =====
    
    public function testResolveRootPath(): void {
        $result = $this->tree->resolvePath('/');
        $this->assertEquals('dir', $result['type']);
        $this->assertEquals($this->tree->getRootDirId(), $result['id']);
    }
    
    public function testResolveNonExistentPath(): void {
        $result = $this->tree->resolvePath('/does/not/exist');
        $this->assertNull($result);
    }
    
    public function testPathNormalization(): void {
        $this->tree->createDirectory('/test');
        
        $r1 = $this->tree->resolvePath('/test');
        $r2 = $this->tree->resolvePath('//test//');
        $r3 = $this->tree->resolvePath('/test/./');
        
        $this->assertEquals($r1['id'], $r2['id']);
        $this->assertEquals($r1['id'], $r3['id']);
    }
    
    public function testParentDirectoryResolution(): void {
        $this->tree->createDirectory('/a');
        $this->tree->createDirectory('/a/b');
        $this->tree->createDirectory('/a/b/c');
        
        $result = $this->tree->resolvePath('/a/b/c/../..');
        $a_result = $this->tree->resolvePath('/a');
        
        $this->assertEquals($a_result['id'], $result['id']);
    }
    
    // ===== FILE OPERATIONS =====
    
    public function testAddFileEntry(): void {
        $this->tree->createDirectory('/files');
        
        $storage_path = $this->createTempFile('test content');
        $file_id = $this->tree->createFileReference($storage_path);
        
        $success = $this->tree->addFileEntry('/files/test.txt', $file_id);
        $this->assertTrue($success);
        
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(1, $file_ref->refcount);
        
        unlink($storage_path);
    }
    
    public function testHardLinks(): void {
        $this->tree->createDirectory('/dir1');
        $this->tree->createDirectory('/dir2');
        
        $storage_path = $this->createTempFile('shared content');
        $file_id = $this->tree->createFileReference($storage_path);
        
        // Create first link
        $this->tree->addFileEntry('/dir1/file.txt', $file_id);
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(1, $file_ref->refcount);
        
        // Create second link (hard link)
        $this->tree->addFileEntry('/dir2/same_file.txt', $file_id);
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(2, $file_ref->refcount);
        
        // Both should resolve to same file_id
        $r1 = $this->tree->resolvePath('/dir1/file.txt');
        $r2 = $this->tree->resolvePath('/dir2/same_file.txt');
        $this->assertEquals($r1['id'], $r2['id']);
        
        unlink($storage_path);
    }
    
    public function testRemoveFileEntry(): void {
        $this->tree->createDirectory('/files');
        
        $storage_path = $this->createTempFile('test');
        $file_id = $this->tree->createFileReference($storage_path);
        $this->tree->addFileEntry('/files/test.txt', $file_id);
        
        $removed_id = $this->tree->removeFileEntry('/files/test.txt');
        $this->assertEquals($file_id, $removed_id);
        
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(0, $file_ref->refcount);
        
        unlink($storage_path);
    }
    
    public function testReferenceCountDecrement(): void {
        $this->tree->createDirectory('/dir1');
        $this->tree->createDirectory('/dir2');
        
        $storage_path = $this->createTempFile('content');
        $file_id = $this->tree->createFileReference($storage_path);
        
        $this->tree->addFileEntry('/dir1/file.txt', $file_id);
        $this->tree->addFileEntry('/dir2/file.txt', $file_id);
        
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(2, $file_ref->refcount);
        
        // Remove one link
        $this->tree->removeFileEntry('/dir1/file.txt');
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(1, $file_ref->refcount);
        
        // Remove second link
        $this->tree->removeFileEntry('/dir2/file.txt');
        $file_ref = $this->tree->getFileReference($file_id);
        $this->assertEquals(0, $file_ref->refcount);
        
        unlink($storage_path);
    }
    
    // ===== MOVE OPERATIONS =====
    
    public function testMoveDirectory(): void {
        $this->tree->createDirectory('/source');
        $this->tree->createDirectory('/dest');
        
        $this->tree->move('/source', '/dest/moved');
        
        $this->assertNull($this->tree->resolvePath('/source'));
        $this->assertNotNull($this->tree->resolvePath('/dest/moved'));
    }
    
    public function testRenameDirectory(): void {
        $dir_id = $this->tree->createDirectory('/old_name');
        
        $this->tree->move('/old_name', '/new_name');
        
        $this->assertNull($this->tree->resolvePath('/old_name'));
        $result = $this->tree->resolvePath('/new_name');
        $this->assertEquals($dir_id, $result['id']);
    }
    
    public function testMoveFile(): void {
        $this->tree->createDirectory('/files');
        $this->tree->createDirectory('/archive');
        
        $storage_path = $this->createTempFile('content');
        $file_id = $this->tree->createFileReference($storage_path);
        $this->tree->addFileEntry('/files/doc.txt', $file_id);
        
        $this->tree->move('/files/doc.txt', '/archive/doc.txt');
        
        $this->assertNull($this->tree->resolvePath('/files/doc.txt'));
        $result = $this->tree->resolvePath('/archive/doc.txt');
        $this->assertEquals($file_id, $result['id']);
        
        unlink($storage_path);
    }
    
    public function testCannotMoveToCauseNameCollision(): void {
        $this->tree->createDirectory('/dir1');
        $this->tree->createDirectory('/dir2');
        $this->tree->createDirectory('/dir2/existing');
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Destination already exists');
        $this->tree->move('/dir1', '/dir2/existing');
    }
    
    public function testCannotMoveDirectoryIntoItself(): void {
        $this->tree->createDirectory('/parent');
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('cycle');
        $this->tree->move('/parent', '/parent/child');
    }
    
    public function testCannotMoveDirectoryIntoDescendant(): void {
        $this->tree->createDirectory('/parent');
        $this->tree->createDirectory('/parent/child');
        $this->tree->createDirectory('/parent/child/grandchild');
        
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('cycle');
        $this->tree->move('/parent', '/parent/child/grandchild/moved');
    }
    
    // ===== GARBAGE COLLECTION =====
    
    public function testGarbageCollection(): void {
        $this->tree->createDirectory('/files');
        
        $storage_path = $this->createTempFile('orphan');
        $file_id = $this->tree->createFileReference($storage_path);
        $this->tree->addFileEntry('/files/temp.txt', $file_id);
        
        // Remove entry (orphans file)
        $this->tree->removeFileEntry('/files/temp.txt');
        
        // Run GC
        $deleted = $this->tree->collectGarbage();
        
        $this->assertContains($file_id, $deleted);
        $this->assertNull($this->tree->getFileReference($file_id));
        $this->assertFileDoesNotExist($storage_path);
    }
    
    // ===== HELPER METHODS =====
    
    private function createTempFile(string $content): string {
        $path = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($path, $content);
        return $path;
    }
}