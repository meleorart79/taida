<?php
namespace Taida\FS\Entities;

class FileReference {
    public string $file_id;
    public int $refcount;
    public string $storage_path;  // Physical location
    public \DateTime $created_at;
    public int $size_bytes;
    public ?string $mime_type;
    
    public function __construct(string $file_id, string $storage_path) {
        $this->file_id = $file_id;
        $this->storage_path = $storage_path;
        $this->refcount = 0;
        $this->created_at = new \DateTime();
        $this->size_bytes = 0;
        $this->mime_type = null;
    }
    
    public function incrementRefcount(): void {
        $this->refcount++;
    }
    
    public function decrementRefcount(): void {
        if ($this->refcount > 0) {
            $this->refcount--;
        }
    }
    
    public function isOrphaned(): bool {
        return $this->refcount === 0;
    }
}