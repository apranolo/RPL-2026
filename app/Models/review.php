<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';

    protected $fillable = [
        'proposal_id',
        'reviewer_id',
        'assessment_criteria_id',
        'score',
        'comment'
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function assessmentCriteria()
    {
        return $this->belongsTo(AssessmentCriteria::class, 'assessment_criteria_id');
    }
}