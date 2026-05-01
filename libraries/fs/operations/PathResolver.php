<?php
namespace Taida\FS\Operations;

class PathResolver {
    const MAX_PATH_DEPTH = 100;
    
    /**
     * Normalize path: remove trailing slashes, resolve . and .., ensure leading /
     */
    public static function normalizePath(string $path): string {
        // Ensure leading slash
        if (empty($path) || $path[0] !== '/') {
            $path = '/' . $path;
        }
        
        // Split into segments
        $segments = explode('/', trim($path, '/'));
        $normalized = [];
        
        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.') {
                // Skip empty and current directory
                continue;
            } elseif ($segment === '..') {
                // Go up one level (if possible)
                if (count($normalized) > 0) {
                    array_pop($normalized);
                }
            } else {
                $normalized[] = $segment;
            }
        }
        
        return '/' . implode('/', $normalized);
    }
    
    /**
     * Validate filename/dirname (no path separators, no nulls, etc.)
     */
    public static function validateName(string $name): ?string {
        // Check length
        if (strlen($name) === 0 || strlen($name) > 255) {
            return "Name must be 1-255 characters";
        }
        
        // Check forbidden characters
        if (strpos($name, '/') !== false || strpos($name, "\0") !== false) {
            return "Name cannot contain / or null bytes";
        }
        
        // Check reserved names
        if ($name === '.' || $name === '..') {
            return "Name cannot be . or ..";
        }
        
        // Check for control characters
        if (preg_match('/[\x00-\x1F\x7F]/', $name)) {
            return "Name cannot contain control characters";
        }
        
        return null; // Valid
    }
    
    /**
     * Split path into parent path and filename
     */
    public static function splitPath(string $path): array {
        $path = self::normalizePath($path);
        
        if ($path === '/') {
            return ['/', ''];
        }
        
        $lastSlash = strrpos($path, '/');
        $parent = $lastSlash === 0 ? '/' : substr($path, 0, $lastSlash);
        $name = substr($path, $lastSlash + 1);
        
        return [$parent, $name];
    }
    
    /**
     * Check if path depth exceeds maximum
     */
    public static function checkDepth(string $path): bool {
        $depth = substr_count(self::normalizePath($path), '/');
        return $depth <= self::MAX_PATH_DEPTH;
    }
}