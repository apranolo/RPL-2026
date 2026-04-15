<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EvaluationCategory Model (Level 1: Unsur Evaluasi)
 *
 * Represents a category within an accreditation template.
 * Contains sub-categories and essay questions.
 *
 * @property int $id
 * @property int $template_id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property float $weight
 * @property int $display_order
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read \App\Models\AccreditationTemplate $template
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationSubCategory[] $subCategories
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EssayQuestion[] $essayQuestions
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationIndicator[] $indicators
 */
class EvaluationCategory extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'evaluation_categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'template_id',
        'code',
        'name',
        'description',
        'weight',
        'display_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'decimal:2',
        'display_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the template that owns this category.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(AccreditationTemplate::class, 'template_id');
    }

    /**
     * Get all sub-categories for this category.
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(EvaluationSubCategory::class, 'category_id')
            ->orderBy('display_order');
    }

    /**
     * Get all essay questions for this category.
     */
    public function essayQuestions(): HasMany
    {
        return $this->hasMany(EssayQuestion::class, 'category_id')
            ->orderBy('display_order');
    }

    /**
     * Get all indicators through sub-categories.
     */
    public function indicators(): HasManyThrough
    {
        return $this->hasManyThrough(
            EvaluationIndicator::class,
            EvaluationSubCategory::class,
            'category_id',      // FK on sub_categories table
            'sub_category_id',  // FK on indicators table
            'id',               // Local key on categories table
            'id'                // Local key on sub_categories table
        )->orderBy('evaluation_indicators.sort_order');
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
     * Scope: Get categories for a specific template.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForTemplate($query, int $templateId)
    {
        return $query->where('template_id', $templateId);
    }

    /**
     * Check if this category can be deleted.
     * Cannot delete if it has active sub-categories or indicators used in submitted assessments.
     */
    public function canBeDeleted(): bool
    {
        // Check if any indicators from this category are used in submitted assessments
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
     * Get count statistics for this category.
     */
    public function getStatistics(): array
    {
        return [
            'sub_categories_count' => $this->subCategories()->count(),
            'indicators_count' => $this->indicators()->count(),
            'essay_questions_count' => $this->essayQuestions()->count(),
            'total_items' => $this->subCategories()->count()
                + $this->indicators()->count()
                + $this->essayQuestions()->count(),
        ];
    }
}
