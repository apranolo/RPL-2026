<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'research_interests',
        'total_reviews',
        'completed_reviews',
        'biography',
    ];

    protected $casts = [
        'research_interests' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
