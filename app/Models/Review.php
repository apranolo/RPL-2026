<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'proposal_id',
        'reviewer_id',
        'status',
    ];

    /**
     * Proposal yang direview.
     */
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Reviewer yang ditugaskan.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}