<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'reviewer_id',
        'due_date',
    ];


    protected $casts = [
        'due_date' => 'date',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'review_assignment_id');
    }
}

