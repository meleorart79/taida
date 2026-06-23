<?php
namespace Taida\FS\Contracts;

/**
 * Abstraction over physical file storage.
 * Implement this to support local disk, S3, or any other backend.
 */
interface StorageBackendInterface
{
    /**
     * Store content and return an opaque storage path/key.
     *
     * @param string $sourcePath Temporary path of the uploaded file
     * @param string $mimeType   MIME type hint
     * @return string            Opaque storage reference (path, key, URI…)
     */
    public function store(string $sourcePath, string $mimeType = ''): string;

    /**
     * Retrieve a readable stream or local path for a stored file.
     *
     * @param string $storageRef  Opaque reference returned by store()
     * @return string             Absolute readable path (may be a temp copy)
     */
    public function retrieve(string $storageRef): string;

    /**
     * Permanently delete a stored file.
     *
     * @param string $storageRef
     * @return bool
     */
    public function delete(string $storageRef): bool;

    /**
     * Return the size in bytes of a stored file.
     *
     * @param string $storageRef
     * @return int
     */
    public function size(string $storageRef): int;

    /**
     * Check whether a stored file exists.
     *
     * @param string $storageRef
     * @return bool
     */
    public function exists(string $storageRef): bool;
}