<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'submission_id',
        'user_id',
        'action',
        'description',
    ];

    /**
     * User pelaku activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
