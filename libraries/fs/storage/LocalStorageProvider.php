<?php
namespace Taida\FS\Storage;

use Taida\FS\Persistence\DirectoryTreePersistence;

class LocalStorageProvider implements StorageProviderInterface {
    private DirectoryTreePersistence $persistence;

    public function __construct(DirectoryTreePersistence $persistence) {
        $this->persistence = $persistence;
    }

    public function register(string $file_id, string $storage_path): void {
        $this->persistence->saveStorageLocation($file_id, $storage_path);
    }

    public function locate(string $file_id): ?string {
        return $this->persistence->loadStoragePath($file_id);
    }

    public function forget(string $file_id): void {
        $this->persistence->deleteStorageLocation($file_id);
    }
}
