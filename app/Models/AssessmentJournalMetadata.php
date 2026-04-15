<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentJournalMetadata extends Model
{
    use HasFactory;

    protected $table = 'assessment_journal_metadata';

    protected $fillable = [
        'journal_assessment_id',
        'volume',
        'number',
        'year',
        'month',
        'url_issue',
        'jumlah_negara_editor',
        'jumlah_institusi_editor',
        'jumlah_negara_reviewer',
        'jumlah_institusi_reviewer',
        'jumlah_negara_author',
        'jumlah_institusi_author',
        'display_order',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'jumlah_negara_editor' => 'integer',
        'jumlah_institusi_editor' => 'integer',
        'jumlah_negara_reviewer' => 'integer',
        'jumlah_institusi_reviewer' => 'integer',
        'jumlah_negara_author' => 'integer',
        'jumlah_institusi_author' => 'integer',
        'display_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the assessment that owns this metadata.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(JournalAssessment::class, 'journal_assessment_id');
    }

    /**
     * Scope to order by display order and creation date.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }

    /**
     * Scope to filter by year.
     */
    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Get the month name.
     */
    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        ];

        return $months[$this->month] ?? 'Unknown';
    }

    /**
     * Get formatted issue identifier (e.g., "Vol. 5 No. 2 (2025)")
     */
    public function getIssueIdentifierAttribute(): string
    {
        return sprintf('Vol. %s No. %s (%d)', $this->volume, $this->number, $this->year);
    }
}
