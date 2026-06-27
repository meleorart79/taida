<?php
namespace Taida\FS\Storage;

interface StorageProviderInterface {
    public function register(string $file_id, string $storage_path): void;

    public function locate(string $file_id): ?string;

    public function forget(string $file_id): void;
}
