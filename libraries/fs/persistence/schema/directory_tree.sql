-- Directories table
CREATE TABLE IF NOT EXISTS fs_directories (
    dir_id VARCHAR(36) PRIMARY KEY,           -- UUID for directory
    parent_id VARCHAR(36) NULL,               -- NULL only for root
    created_at DATETIME NOT NULL,
    modified_at DATETIME NOT NULL,
    
    FOREIGN KEY (parent_id) REFERENCES fs_directories(dir_id) ON DELETE RESTRICT,
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Directory entries table (name → target mapping)
CREATE TABLE IF NOT EXISTS fs_directory_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id VARCHAR(36) NOT NULL,           -- Which directory owns this entry
    name VARCHAR(255) NOT NULL,               -- Entry name (filename/dirname)
    target_id VARCHAR(36) NOT NULL,           -- Points to dir_id or file_id
    target_type ENUM('dir', 'file') NOT NULL, -- Target type
    created_at DATETIME NOT NULL,
    
    FOREIGN KEY (parent_id) REFERENCES fs_directories(dir_id) ON DELETE CASCADE,
    UNIQUE KEY unique_name_per_dir (parent_id, name),
    INDEX idx_target (target_id, target_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File references table (file metadata)
CREATE TABLE IF NOT EXISTS fs_file_references (
    file_id VARCHAR(36) PRIMARY KEY,          -- UUID for file
    refcount INT NOT NULL DEFAULT 0,          -- Hard link count
    storage_path VARCHAR(512) NOT NULL,       -- Physical path (opaque)
    created_at DATETIME NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(127) NULL,
    
    INDEX idx_refcount (refcount),
    INDEX idx_storage (storage_path(191))     -- For orphan detection
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System metadata (root directory, etc.)
CREATE TABLE IF NOT EXISTS fs_metadata (
    key_name VARCHAR(64) PRIMARY KEY,
    value_data TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert root directory
INSERT INTO fs_directories (dir_id, parent_id, created_at, modified_at)
VALUES ('ROOT', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE dir_id=dir_id;

INSERT INTO fs_metadata (key_name, value_data)
VALUES ('root_dir_id', 'ROOT')
ON DUPLICATE KEY UPDATE value_data='ROOT';