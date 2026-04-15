<?php

namespace App\Models;

use App\Exceptions\InvalidCategoryMoveException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EvaluationSubCategory Model (Level 2: Sub-Unsur)
 *
 * Represents a sub-category within an evaluation category.
 * Contains indicators (pilihan ganda/scale).
 *
 * @property int $id
 * @property int $category_id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property int $display_order
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read \App\Models\EvaluationCategory $category
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationIndicator[] $indicators
 */
class EvaluationSubCategory extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'evaluation_sub_categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'code',
        'name',
        'description',
        'display_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'display_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the category that owns this sub-category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EvaluationCategory::class, 'category_id');
    }

    /**
     * Get all indicators for this sub-category.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(EvaluationIndicator::class, 'sub_category_id')
            ->orderBy('sort_order');
    }

    /**
     * Scope: Order by display order.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    /**
     * Scope: Get sub-categories for a specific category.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Check if this sub-category can be deleted.
     * Cannot delete if it has indicators used in submitted assessments.
     */
    public function canBeDeleted(): bool
    {
        // Check if any indicators from this sub-category are used in submitted assessments
        $indicatorsUsedInAssessments = $this->indicators()
            ->whereHas('responses', function ($query) {
                $query->whereHas('journalAssessment', function ($q) {
                    $q->where('status', 'submitted');
                });
            })
            ->exists();

        return ! $indicatorsUsedInAssessments;
    }

    /**
     * Get the template through category relationship.
     */
    public function getTemplate(): ?AccreditationTemplate
    {
        return $this->category?->template;
    }

    /**
     * Move this sub-category to a different category.
     * Validates that target category is in the same template.
     *
     * @throws \App\Exceptions\InvalidCategoryMoveException
     */
    public function moveToCategory(int $newCategoryId): bool
    {
        $newCategory = EvaluationCategory::findOrFail($newCategoryId);

        // Validate: target category must be in the same template
        if ($this->category->template_id !== $newCategory->template_id) {
            throw new InvalidCategoryMoveException;
        }

        $this->category_id = $newCategoryId;

        return $this->save();
    }
}
