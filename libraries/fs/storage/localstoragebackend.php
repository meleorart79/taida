<?php
namespace Taida\FS\Storage;

use Taida\FS\Contracts\StorageBackendInterface;

class LocalStorageBackend implements StorageBackendInterface
{
    private string $root;
    private int    $hashDepth;

    public function __construct(string $root, int $hashDepth = 2)
    {
        $this->root      = rtrim($root, '/');
        $this->hashDepth = $hashDepth;
    }

    public function store(string $sourcePath, string $mimeType = ''): string
    {
        $hash    = bin2hex(random_bytes(16));
        $subdir  = $this->buildSubdir($hash);
        $destDir = $this->root . '/' . $subdir;

        if (!is_dir($destDir) && !mkdir($destDir, 0755, true)) {
            throw new \RuntimeException("Cannot create storage directory: $destDir");
        }

        $dest = $destDir . '/' . $hash;

        if (!copy($sourcePath, $dest)) {
            throw new \RuntimeException("Cannot copy file to storage: $dest");
        }

        return $subdir . '/' . $hash; // relative opaque ref
    }

    public function retrieve(string $storageRef): string
    {
        $path = $this->resolvePath($storageRef);

        if (!file_exists($path)) {
            throw new \RuntimeException("Storage file not found: $storageRef");
        }

        return $path;
    }

    public function delete(string $storageRef): bool
    {
        $path = $this->resolvePath($storageRef);

        if (!file_exists($path)) {
            return true; // already gone — idempotent
        }

        return @unlink($path);
    }

    public function size(string $storageRef): int
    {
        $path = $this->resolvePath($storageRef);
        return file_exists($path) ? (int) filesize($path) : 0;
    }

    public function exists(string $storageRef): bool
    {
        return file_exists($this->resolvePath($storageRef));
    }

    // ── private ──────────────────────────────────────────────────────────────

    private function buildSubdir(string $hash): string
    {
        $parts = [];
        for ($i = 0; $i < $this->hashDepth; $i++) {
            $parts[] = substr($hash, $i * 2, 2);
        }
        return implode('/', $parts);
    }

    private function resolvePath(string $storageRef): string
    {
        if ($this->isAbsolutePath($storageRef)) {
            return $storageRef;
        }

        return $this->root . '/' . $storageRef;
    }

    private function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/') || preg_match('/^[A-Za-z]:[\\\\\\/]/', $path) === 1;
    }
}
