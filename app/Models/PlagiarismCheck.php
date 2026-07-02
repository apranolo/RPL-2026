<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlagiarismCheck extends Model
{
    protected $fillable = [
        'submission_version_id',
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
     * Relasi ke submission version yang diperiksa.
     */
    public function submissionVersion(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class);
    }
}