<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewSchedule extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'review_schedules';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reviewer_id',
        'proposal_id',
        'assigned_by',
        'assigned_at',
        'start_date',
        'end_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the reviewer assigned
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the proposal this schedule is for
     */
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Get the user who assigned the reviewer
     */
    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter by reviewer
     */
    public function scopeForReviewer($query, int $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    public function scopeByReviewer($query, int $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if assignment is assigned (not started)
     */
    public function isAssigned(): bool
    {
        return $this->status === 'assigned';
    }

    /**
     * Check if assignment is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if assignment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'assigned' => 'Assigned',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            default => $this->status,
        };
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'assigned' => 'secondary',
            'in_progress' => 'warning',
            'completed' => 'success',
            default => 'default',
        };
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set assigned_at on create
        static::creating(function ($model) {
            if (! $model->assigned_at) {
                $model->assigned_at = now();
            }

            if (auth()->check() && ! $model->assigned_by) {
                $model->assigned_by = auth()->id();
            }
        });
    }
}
