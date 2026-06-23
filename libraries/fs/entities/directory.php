<?php
namespace Taida\FS\Entities;

class Directory {
    public string $dir_id;
    public ?string $parent_id;  // NULL for root
    public array $entries;      // Array of DirectoryEntry objects
    public \DateTime $created_at;
    public \DateTime $modified_at;
    
    public function __construct(string $dir_id, ?string $parent_id) {
        $this->dir_id = $dir_id;
        $this->parent_id = $parent_id;
        $this->entries = [];
        $this->created_at = new \DateTime();
        $this->modified_at = new \DateTime();
    }
    
    public function hasEntry(string $name): bool {
        return isset($this->entries[$name]);
    }
    
    public function getEntry(string $name): ?DirectoryEntry {
        return $this->entries[$name] ?? null;
    }
    
    public function addEntry(DirectoryEntry $entry): void {
        $this->entries[$entry->name] = $entry;
        $this->modified_at = new \DateTime();
    }
    
    public function removeEntry(string $name): ?DirectoryEntry {
        $entry = $this->entries[$name] ?? null;
        unset($this->entries[$name]);
        $this->modified_at = new \DateTime();
        return $entry;
    }
}