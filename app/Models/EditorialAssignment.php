<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EditorialAssignment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'submission_id',
        'editor_id',
        'assigned_by',
        'assigned_at',
        'status',
        'decision',
        'decision_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
        'decision_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'status_label',
        'status_color',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the submission this assignment belongs to
     */
    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    /**
     * Get the editor assigned
     */
    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /**
     * Get the user who made the assignment
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
     * Scope to filter by editor
     */
    public function scopeForEditor($query, int $editorId)
    {
        return $query->where('editor_id', $editorId);
    }

    /**
     * Scope to get only pending assignments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get only active assignments
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get only completed assignments
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, ?string $status)
    {
        if (! $status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'active' => 'Active',
            'completed' => 'Completed',
            'declined' => 'Declined',
            default => $this->status,
        };
    }

    /**
     * Get status color for badge
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'active' => 'blue',
            'completed' => 'green',
            'declined' => 'red',
            default => 'gray',
        };
    }

    /**
     * Check if assignment is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if assignment is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if assignment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Accept this assignment (change pending → active)
     */
    public function accept(): bool
    {
        $this->status = 'active';

        return $this->save();
    }

    /**
     * Decline this assignment
     */
    public function decline(?string $reason = null): bool
    {
        $this->status = 'declined';
        $this->notes = $reason;

        return $this->save();
    }

    /**
     * Record a decision on the submission
     */
    public function recordDecision(string $decision, ?string $notes = null): bool
    {
        $this->decision = $decision;
        $this->decision_at = now();
        $this->status = 'completed';
        $this->notes = $notes;

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
    }
}
