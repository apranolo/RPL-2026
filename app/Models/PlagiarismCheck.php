<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlagiarismCheck extends Model
{
    protected $fillable = [
        'journal_assessment_id',
        'similarity_score',
        'checked_at',
        'report_file_path',
        'source_breakdown',
        'status',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
        'source_breakdown' => 'array',
    ];

    /**
     * Relasi ke journal assessment yang diperiksa plagiasinya.
     */
    public function journalAssessment(): BelongsTo
    {
        return $this->belongsTo(JournalAssessment::class);
    }
}