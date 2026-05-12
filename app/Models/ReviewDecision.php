<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewDecision extends Model
{
    protected $fillable = [
        'id_submission',
        'id_reviewer',
        'recommendation',
        'comments',
        'comments_private',
        'score_originality',
        'score_methodology',
        'score_writing',
        'score_relevance',
        'score_conclusion',
        'score_aggregate',
        'status',
        'date_decided',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'id_reviewer');
    }
}