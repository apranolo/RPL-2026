<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'user_id',
        'action',
        'description',
    ];

    /**
     * Virtual attributes appended to array/JSON representation.
     */
    protected $appends = [
        'id_submission',
        'id_user',
        'user_name',
        'action_type',
        'activity_description',
    ];

    /**
     * Relasi ke User yang melakukan aktivitas
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Submission (jika ada)
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getIdSubmissionAttribute(): ?int
    {
        return $this->submission_id;
    }

    public function getIdUserAttribute(): ?int
    {
        return $this->user_id;
    }

    public function getUserNameAttribute(): string
    {
        return $this->user?->name ?? 'System';
    }

    public function getActionTypeAttribute(): string
    {
        return $this->action;
    }

    public function getActivityDescriptionAttribute(): ?string
    {
        return $this->description;
    }
}
