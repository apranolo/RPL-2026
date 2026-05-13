<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * AccreditationTemplate Model
 *
 * Top-level template for hierarchical borang indikator management.
 * Supports two types: 'akreditasi' (BAN-PT) and 'indeksasi' (Scopus/Sinta).
 *
 * Hierarchy:
 * Template → Categories (Unsur) → SubCategories (Sub-Unsur) → Indicators
 *         → Essays (linked to Categories)
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $version
 * @property string $type 'akreditasi' or 'indeksasi'
 * @property bool $is_active
 * @property \Carbon\Carbon|null $effective_date
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationCategory[] $categories
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationSubCategory[] $subCategories
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EvaluationIndicator[] $indicators
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\EssayQuestion[] $essayQuestions
 */
class AccreditationTemplate extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'accreditation_templates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'version',
        'type',
        'is_active',
        'effective_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'effective_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get all categories (Unsur Evaluasi) for this template.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(EvaluationCategory::class, 'template_id')
            ->orderBy('display_order');
    }

    /**
     * Get all sub-categories through categories.
     */
    public function subCategories(): HasManyThrough
    {
        return $this->hasManyThrough(
            EvaluationSubCategory::class,
            EvaluationCategory::class,
            'template_id',      // FK on categories table
            'category_id',      // FK on sub_categories table
            'id',               // Local key on templates table
            'id'                // Local key on categories table
        )->orderBy('evaluation_sub_categories.display_order');
    }

    /**
     * Query indicators through categories and sub-categories (3-level relationship).
     * Note: Laravel's hasManyThrough only supports 2 levels.
     * Use this as a query method: $template->indicators()->where(...)->get()
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function indicators()
    {
        return EvaluationIndicator::whereHas('subCategory.category', function ($query) {
            $query->where('template_id', $this->id);
        })->orderBy('sort_order');
    }

    /**
     * Get indicators attribute (cached collection).
     * Use this as a property: $template->indicators
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getIndicatorsAttribute()
    {
        if (! array_key_exists('indicators', $this->relations)) {
            $this->setRelation('indicators', $this->indicators()->get());
        }

        return $this->getRelation('indicators');
    }

    /**
     * Get all essay questions through categories.
     */
    public function essayQuestions(): HasManyThrough
    {
        return $this->hasManyThrough(
            EssayQuestion::class,
            EvaluationCategory::class,
            'template_id',      // FK on categories table
            'category_id',      // FK on essay_questions table
            'id',               // Local key on templates table
            'id'                // Local key on categories table
        )->orderBy('essay_questions.display_order');
    }

    /**
     * Scope: Get only active templates.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get templates by type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type  'akreditasi' or 'indeksasi'
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Order by effective date (newest first).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('effective_date', 'desc')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Check if this template can be deleted.
     * Cannot delete if:
     * - It's the only active template of its type
     * - It has categories, indicators, or essay questions
     * - It has submitted assessments using its indicators
     */
    public function canBeDeleted(): bool
    {
        // Check if it's the only active template of its type
        if ($this->is_active) {
            $activeCount = static::active()
                ->where('type', $this->type)
                ->where('id', '!=', $this->id)
                ->count();

            if ($activeCount === 0) {
                return false;
            }
        }

        // Check for child relationships
        if ($this->categories()->exists()) {
            return false;
        }

        if ($this->essayQuestions()->exists()) {
            return false;
        }

        // Check if any indicators from this template are used in submitted assessments
        $indicatorsUsedInAssessments = EvaluationIndicator::query()
            ->join('evaluation_sub_categories', 'evaluation_indicators.sub_category_id', '=', 'evaluation_sub_categories.id')
            ->join('evaluation_categories', 'evaluation_sub_categories.category_id', '=', 'evaluation_categories.id')
            ->where('evaluation_categories.template_id', $this->id)
            ->whereHas('responses.journalAssessment', function ($query) {
                $query->where('status', 'submitted');
            })->exists();

        return ! $indicatorsUsedInAssessments;
    }

    /**
     * Get total weight of all categories in this template.
     * Should not exceed 100.
     */
    public function getTotalWeight(): float
    {
        return $this->categories()->sum('weight');
    }

    /**
     * Clone this template with all its hierarchy (deep copy).
     *
     * Performance: Eager loads all relationships before cloning to prevent N+1 queries.
     * Without eager loading: O(1 + N + N*M + N*M*P) queries
     * With eager loading: O(4) queries regardless of hierarchy depth
     *
     * @param  string|null  $newName  Optional new name for the cloned template
     */
    public function cloneTemplate(?string $newName = null): self
    {
        // Eager load entire hierarchy to prevent N+1 queries
        $this->load([
            'categories.subCategories.indicators',
            'categories.essayQuestions',
        ]);

        $clone = $this->replicate();
        $clone->name = $newName ?? $this->name.' - Copy';
        $clone->is_active = false; // New clones start as inactive
        $clone->save();

        // Clone categories (already loaded, no additional queries)
        foreach ($this->categories as $category) {
            $categoryClone = $category->replicate();
            $categoryClone->template_id = $clone->id;
            $categoryClone->save();

            // Clone sub-categories (already loaded, no additional queries)
            foreach ($category->subCategories as $subCategory) {
                $subCategoryClone = $subCategory->replicate();
                $subCategoryClone->category_id = $categoryClone->id;
                $subCategoryClone->save();

                // Clone indicators (already loaded, no additional queries)
                foreach ($subCategory->indicators as $indicator) {
                    $indicatorClone = $indicator->replicate();
                    $indicatorClone->sub_category_id = $subCategoryClone->id;
                    // Append "-C" and a short unique hash to stay within the 20-char limit of the 'code' column
                    $indicatorClone->code = substr($indicator->code, 0, 10).'-C'.substr(md5(uniqid()), 0, 4);
                    $indicatorClone->save();
                }
            }

            // Clone essay questions (already loaded, no additional queries)
            foreach ($category->essayQuestions as $essay) {
                $essayClone = $essay->replicate();
                $essayClone->category_id = $categoryClone->id;
                $essayClone->save();
            }
        }

        return $clone->fresh();
    }
}
