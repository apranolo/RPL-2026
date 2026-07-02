<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'reviewer_id',
        'status',
        'notes',
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
        return $this->hasMany(AssessmentCriteria::class, 'review_id');
    }
}