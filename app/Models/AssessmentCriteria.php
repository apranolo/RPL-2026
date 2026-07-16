<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentCriteria extends Model
{
    use HasFactory;

    protected $table = 'assessment_criterias';

    protected $fillable = [
        'review_id',
        'criterion',
        'score',
        'notes',
    ];

    public function review()
    {
        return $this->belongsTo(Review::class, 'review_id');
    }
}