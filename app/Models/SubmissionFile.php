<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    /**
     * Relasi balik ke model induk Submission
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}