<?php
namespace Taida\Tests\FS;

use PHPUnit\Framework\TestCase;
use Taida\FS\Operations\PathResolver;

class PathResolverTest extends TestCase {
    public function testNormalizePath(): void {
        $this->assertEquals('/', PathResolver::normalizePath('/'));
        $this->assertEquals('/test', PathResolver::normalizePath('/test'));
        $this->assertEquals('/test', PathResolver::normalizePath('//test//'));
        $this->assertEquals('/test', PathResolver::normalizePath('/./test'));
        $this->assertEquals('/', PathResolver::normalizePath('/test/..'));
        $this->assertEquals('/a/c', PathResolver::normalizePath('/a/b/../c'));
    }
    
    public function testValidateName(): void {
        $this->assertNull(PathResolver::validateName('valid_name'));
        $this->assertNull(PathResolver::validateName('file.txt'));
        $this->assertNull(PathResolver::validateName('my-file_123'));
        
        $this->assertNotNull(PathResolver::validateName(''));
        $this->assertNotNull(PathResolver::validateName('.'));
        $this->assertNotNull(PathResolver::validateName('..'));
        $this->assertNotNull(PathResolver::validateName('has/slash'));
        $this->assertNotNull(PathResolver::validateName("has\0null"));
    }
    
    public function testSplitPath(): void {
        $this->assertEquals(['/', 'test'], PathResolver::splitPath('/test'));
        $this->assertEquals(['/parent', 'child'], PathResolver::splitPath('/parent/child'));
        $this->assertEquals(['/', ''], PathResolver::splitPath('/'));
    }
    
    public function testCheckDepth(): void {
        $shallow = '/a/b/c';
        $this->assertTrue(PathResolver::checkDepth($shallow));
        
        // Create very deep path
        $deep = '/' . implode('/', array_fill(0, 150, 'dir'));
        $this->assertFalse(PathResolver::checkDepth($deep));
    }
}