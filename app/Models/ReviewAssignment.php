<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Proposal;
use App\Models\User;


class ReviewAssignment extends Model
{
    use HasFactory;

    protected $table = 'review_assignments';


    protected $fillable = [
        'submission_id',
        'reviewer_id',
        'status',
    ];

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function submission()
    {
        return $this->belongsTo(Proposal::class, 'submission_id');
    }


    public function reviews()
    {
        return $this->hasMany(Review::class, 'review_assignment_id');
    }
}