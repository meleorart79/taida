<?php
namespace Taida\FS\Entities;

class DirectoryEntry {
    public string $name;
    public string $target_id;   // dir_id or file_id
    public string $target_type; // 'dir' or 'file'
    public \DateTime $created_at;
    
    public function __construct(string $name, string $target_id, string $target_type) {
        if (!in_array($target_type, ['dir', 'file'])) {
            throw new \InvalidArgumentException("Invalid target_type: $target_type");
        }
        
        $this->name = $name;
        $this->target_id = $target_id;
        $this->target_type = $target_type;
        $this->created_at = new \DateTime();
    }
    
    public function isDirectory(): bool {
        return $this->target_type === 'dir';
    }
    
    public function isFile(): bool {
        return $this->target_type === 'file';
    }
}