<?php
/**
 * DirectoryTree Configuration
 */

return [
    // Database configuration
    'database' => [
        'dsn' => 'mysql:host=localhost;dbname=taida;charset=utf8mb4',
        'username' => 'root',
        'password' => '',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    ],
    
    // Table configuration
    'tables' => [
        'prefix' => 'fs_',  // Table name prefix
        'directories' => 'directories',
        'entries' => 'directory_entries',
        'files' => 'file_references',
        'metadata' => 'metadata'
    ],
    
    // Root directory
    'root_dir_id' => 'ROOT',
    
    // Limits
    'max_path_depth' => 100,
    'max_name_length' => 255,
    'max_refcount' => 10000,  // Sanity check
    
    // Performance
    'enable_cache' => true,
    'cache_ttl' => 3600,  // seconds
    'cache_size' => 1000,  // max cached entries
    
    // Garbage collection
    'gc_enabled' => true,
    'gc_batch_size' => 100,
    'gc_interval' => 3600,  // Run every hour
    
    // Debug and logging
    'debug_mode' => false,
    'log_level' => 'warning',  // error, warning, info, debug
    'log_file' => '/var/log/taida/directory_tree.log',
    
    // Migration settings
    'migration' => [
        'backup_before_migration' => true,
        'verify_after_migration' => true,
        'rollback_on_error' => true
    ],
    
    // Storage
    'storage' => [
        'root' => '/var/www/taida/storage/files',
        'strategy' => 'hash',  // hash, date, uuid
        'hash_depth' => 2      // For hash strategy: ab/cd/ef/file
    ]
];

/*
        Usage in code?:
<?php
// Load configuration
$config = require 'config/directory_tree.conf.php';

// Initialize database
$db = new PDO(
    $config['database']['dsn'],
    $config['database']['username'],
    $config['database']['password'],
    $config['database']['options']
);

// Create DirectoryTree
$persistence = new DirectoryTreePersistence($db);
$tree = new DirectoryTree($persistence);
$tree->setDebugMode($config['debug_mode']);
    */