<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScientificField extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'parent_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get all journals in this scientific field
     */
    public function journals()
    {
        return $this->hasMany(Journal::class);
    }

    /**
     * Get parent scientific field (for sub-categories)
     */
    public function parent()
    {
        return $this->belongsTo(ScientificField::class, 'parent_id');
    }

    /**
     * Get child scientific fields (sub-categories)
     */
    public function children()
    {
        return $this->hasMany(ScientificField::class, 'parent_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active scientific fields
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only parent categories (no parent_id)
     */
    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get only child categories (has parent_id)
     */
    public function scopeChildren($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if this is a parent category
     */
    public function isParent(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Get full hierarchical name
     */
    public function getFullNameAttribute(): string
    {
        if ($this->parent) {
            return "{$this->parent->name} - {$this->name}";
        }

        return $this->name;
    }
}
