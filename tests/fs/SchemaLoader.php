<?php
namespace Taida\Tests\FS;

function load_sqlite_schema(\PDO $db): void {
    $db->exec("
        CREATE TABLE IF NOT EXISTS fs_directories (
            dir_id VARCHAR(36) PRIMARY KEY,
            parent_id VARCHAR(36) NULL,
            created_at DATETIME NOT NULL,
            modified_at DATETIME NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES fs_directories(dir_id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_parent ON fs_directories (parent_id);

        CREATE TABLE IF NOT EXISTS fs_directory_entries (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            target_id VARCHAR(36) NOT NULL,
            target_type TEXT NOT NULL CHECK (target_type IN ('dir', 'file')),
            created_at DATETIME NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES fs_directories(dir_id) ON DELETE CASCADE,
            UNIQUE (parent_id, name)
        );

        CREATE INDEX IF NOT EXISTS idx_target ON fs_directory_entries (target_id, target_type);

        CREATE TABLE IF NOT EXISTS fs_file_references (
            file_id VARCHAR(36) PRIMARY KEY,
            refcount INT NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            size_bytes BIGINT NOT NULL DEFAULT 0,
            mime_type VARCHAR(127) NULL
        );

        CREATE INDEX IF NOT EXISTS idx_refcount ON fs_file_references (refcount);

        CREATE TABLE IF NOT EXISTS fs_storage_locations (
            file_id VARCHAR(36) PRIMARY KEY,
            storage_path VARCHAR(512) NOT NULL,
            FOREIGN KEY (file_id) REFERENCES fs_file_references(file_id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_storage ON fs_storage_locations (storage_path);

        CREATE TABLE IF NOT EXISTS fs_metadata (
            key_name VARCHAR(64) PRIMARY KEY,
            value_data TEXT NOT NULL
        );

        INSERT OR IGNORE INTO fs_directories (dir_id, parent_id, created_at, modified_at)
        VALUES ('ROOT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT OR REPLACE INTO fs_metadata (key_name, value_data)
        VALUES ('root_dir_id', 'ROOT');
    ");
}
