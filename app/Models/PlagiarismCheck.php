<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlagiarismCheck extends Model
{
    protected $fillable = [
        'submission_id',
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

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}