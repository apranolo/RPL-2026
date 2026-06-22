<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Citation extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'author',
        'publication_year',
        'journal',
        'volume',
        'issue',
        'pages',
        'doi',
    ];

    /**
     * The user this citation belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}