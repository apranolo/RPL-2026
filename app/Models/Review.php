<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'review_assignment_id',
        'criteria_id',
        'score',
        'recommendation',
    ];

    public function assignment()
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }

    public function criteria()
    {
        return $this->belongsTo(EvaluationIndicator::class, 'criteria_id');
    }
}