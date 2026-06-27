<?php
namespace Taida\FS\Resolution;

use Taida\FS\DirectoryTree;
use Taida\FS\Operations\PathResolver;

class VirtualPathResolver {
    private DirectoryTree $tree;

    public function __construct(DirectoryTree $tree) {
        $this->tree = $tree;
    }

    public function resolve(string $path): ?array {
        $path = PathResolver::normalizePath($path);

        if (!PathResolver::checkDepth($path)) {
            throw new \RuntimeException("Path exceeds maximum depth: $path");
        }

        if ($path === '/') {
            return ['type' => 'dir', 'id' => $this->tree->getRootDirId()];
        }

        $segments = array_filter(explode('/', trim($path, '/')));
        $current_dir_id = $this->tree->getRootDirId();

        foreach ($segments as $idx => $segment) {
            $dir = $this->tree->getDirectory($current_dir_id);
            if (!$dir) {
                return null;
            }

            $entry = $dir->getEntry($segment);
            if (!$entry) {
                return null;
            }

            if ($idx === array_key_last($segments)) {
                return [
                    'type' => $entry->target_type,
                    'id' => $entry->target_id
                ];
            }

            if ($entry->target_type !== 'dir') {
                return null;
            }

            $current_dir_id = $entry->target_id;
        }

        return null;
    }

    public function resolveDirectory(string $path): array {
        $result = $this->resolve($path);
        if (!$result || $result['type'] !== 'dir') {
            throw new \RuntimeException("Directory not found: $path");
        }

        return $result;
    }

    public function resolveParent(string $path): array {
        [$parent_path, $name] = PathResolver::splitPath($path);
        $parent_result = $this->resolveDirectory($parent_path);

        return [$parent_result, $name, $parent_path];
    }
}
