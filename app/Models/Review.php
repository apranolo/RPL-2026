<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_assignment_id',
        'criterion_name',
        'score',
        'notes',
    ];

    protected $casts = [
        'score' => 'integer',
        'notes' => 'string',
    ];

    public function reviewAssignment(): BelongsTo
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }
}