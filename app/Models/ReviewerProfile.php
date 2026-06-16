<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'skills',
        'total_reviews',
        'completed_reviews',
        'bio',
    ];

    protected $casts = [
        'skills' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
