<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationIndicator extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'sub_category_id',  // NEW v1.1: FK to evaluation_sub_categories
        'category',         // DEPRECATED v1.1: Use sub_category_id relation
        'sub_category',     // DEPRECATED v1.1: Use sub_category_id relation
        'code',
        'question',
        'description',
        'weight',
        'answer_type',
        'requires_attachment',
        'sort_order',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'decimal:2',
        'requires_attachment' => 'boolean',
        'sort_order' => 'integer',
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
     * Get all assessment responses for this indicator
     */
    public function responses()
    {
        return $this->hasMany(AssessmentResponse::class);
    }

    /**
     * Get the sub-category that owns this indicator (NEW v1.1).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function subCategory()
    {
        return $this->belongsTo(EvaluationSubCategory::class, 'sub_category_id');
    }

    /**
     * Get the category through sub-category relationship (NEW v1.1).
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function categoryRelation()
    {
        return $this->hasOneThrough(
            EvaluationCategory::class,
            EvaluationSubCategory::class,
            'id',               // FK on sub_categories table
            'id',               // FK on categories table
            'sub_category_id',  // Local key on indicators table
            'category_id'       // Local key on sub_categories table
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active indicators
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get indicators by category (DEPRECATED - use ByCategoryId for v1.1)
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Get indicators by sub-category ID (NEW v1.1).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBySubCategory($query, int $subCategoryId)
    {
        return $query->where('sub_category_id', $subCategoryId);
    }

    /**
     * Scope: Get indicators by category ID through relationship (NEW v1.1).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategoryId($query, int $categoryId)
    {
        return $query->whereHas('subCategory', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        });
    }

    /**
     * Scope to order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get answer type label
     */
    public function getAnswerTypeLabelAttribute(): string
    {
        return match ($this->answer_type) {
            'boolean' => 'Ya/Tidak',
            'scale' => 'Skala 1-5',
            'text' => 'Text Input',
            default => $this->answer_type,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Calculate score for a given answer
     */
    public function calculateScore($answer): float
    {
        return match ($this->answer_type) {
            'boolean' => $answer ? $this->weight : 0,
            'scale' => ($answer / 5) * $this->weight,
            'text' => 0, // Text answers need manual review
            default => 0,
        };
    }

    /**
     * Get all unique categories (DEPRECATED v1.1 - for backward compatibility only)
     */
    public static function getCategories(): array
    {
        return self::active()
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Get the template through sub-category → category chain (NEW v1.1).
     */
    public function getTemplate(): ?AccreditationTemplate
    {
        return $this->subCategory?->category?->template;
    }

    /**
     * Check if this is a v1.1 hierarchical indicator.
     */
    public function isHierarchical(): bool
    {
        return ! is_null($this->sub_category_id);
    }

    /**
     * Check if this is a legacy v1.0 flat indicator.
     */
    public function isLegacy(): bool
    {
        return is_null($this->sub_category_id);
    }
}
