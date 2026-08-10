<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'user_id',
        'loggable_type',
        'loggable_id',
        'action',
        'description',
        'changes',
        'ip_address',
        'user_agent',
    ];

    protected $appends = [
        'actor_name',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    /**
     * Accessor for actor_name.
     */
    public function getActorNameAttribute(): string
    {
        return $this->user ? $this->user->name : 'System';
    }

    /**
     * Get the user that triggered the log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the university that owns the log.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get the parent loggable model.
     */
    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }
}
