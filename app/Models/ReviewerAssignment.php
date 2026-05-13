<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewerAssignment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reviewer_id',
        'registration_id',
        'assigned_by',
        'assigned_at',
        'status',
        'updated_by',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
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
     * Get the registration this assignment is for
     */
    public function registration()
    {
        return $this->belongsTo(PembinaanRegistration::class);
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
     * Scope to get only assigned status
     */
    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    /**
     * Scope to get only in progress status
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope to get only completed status
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to filter by reviewer
     */
    public function scopeForReviewer($query, int $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    /**
     * Scope to filter by registration
     */
    public function scopeForRegistration($query, int $registrationId)
    {
        return $query->where('registration_id', $registrationId);
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
     * Mark as in progress
     */
    public function markInProgress(): bool
    {
        $this->status = 'in_progress';

        return $this->save();
    }

    /**
     * Mark as completed
     */
    public function markCompleted(): bool
    {
        $this->status = 'completed';

        return $this->save();
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

        // Auto-fill updated_by on update
        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        // Auto-fill deleted_by on soft delete
        static::deleting(function ($model) {
            if (auth()->check() && ! $model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
}
