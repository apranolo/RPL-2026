<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewDecision extends Model
{
    protected $fillable = [
        'review_assignment_id',
        'reviewer_id',
        'recommendation',
        'scores',
        'overall_comment',
        'is_submitted',
        'submitted_at',
    ];

    protected $casts = [
        'scores' => 'array',
        'is_submitted' => 'boolean',
        'submitted_at' => 'datetime',
    ];
}
