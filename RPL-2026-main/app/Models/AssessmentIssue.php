<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_assessment_id',
        'title',
        'description',
        'category',
        'priority',
        'display_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'display_order' => 'integer',
    ];

    /**
     * Get the assessment that owns this issue.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(JournalAssessment::class, 'journal_assessment_id');
    }

    /**
     * Scope to filter by priority.
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to filter by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to order by display order and creation date.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }
}
