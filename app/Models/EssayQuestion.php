<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EssayQuestion Model
 *
 * Represents an essay-type question linked to a category (Unsur Evaluasi).
 * Different from indicators - essays are manually evaluated, not auto-scored.
 *
 * @property int $id
 * @property int $category_id
 * @property string $code
 * @property string $question
 * @property string|null $guidance
 * @property int $max_words
 * @property bool $is_required
 * @property int $display_order
 * @property bool $is_active
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read \App\Models\EvaluationCategory $category
 */
class EssayQuestion extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'essay_questions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'code',
        'question',
        'guidance',
        'max_words',
        'is_required',
        'display_order',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'max_words' => 'integer',
        'is_required' => 'boolean',
        'display_order' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the category that owns this essay question.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EvaluationCategory::class, 'category_id');
    }

    /**
     * Scope: Get only active essay questions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get only required essay questions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
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
     * Scope: Get essay questions for a specific category.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Get the template through category relationship.
     */
    public function getTemplate(): ?AccreditationTemplate
    {
        return $this->category?->template;
    }

    /**
     * Validate word count for an answer.
     */
    public function validateWordCount(string $answer): bool
    {
        $wordCount = str_word_count(strip_tags($answer));

        return $wordCount <= $this->max_words;
    }

    /**
     * Get word count for an answer.
     */
    public function getWordCount(string $answer): int
    {
        return str_word_count(strip_tags($answer));
    }
}
