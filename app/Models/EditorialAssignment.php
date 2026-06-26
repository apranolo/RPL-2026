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
        'editor_id',
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
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the Section Editor assigned
     */
    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /**
     * Get the registration this assignment is for
     */
    public function registration()
    {
        return $this->belongsTo(PembinaanRegistration::class);
    }

    /**
     * Get the user who assigned the editor
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

    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForEditor($query, int $editorId)
    {
        return $query->where('editor_id', $editorId);
    }

    public function scopeForRegistration($query, int $registrationId)
    {
        return $query->where('registration_id', $registrationId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    public function isAssigned(): bool
    {
        return $this->status === 'assigned';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'assigned'    => 'Assigned',
            'in_progress' => 'In Progress',
            'completed'   => 'Completed',
            default       => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'assigned'    => 'secondary',
            'in_progress' => 'warning',
            'completed'   => 'success',
            default       => 'default',
        };
    }

    public function markInProgress(): bool
    {
        $this->status = 'in_progress';

        return $this->save();
    }

    public function markCompleted(): bool
    {
        $this->status = 'completed';

        return $this->save();
    }

    /*
    |--------------------------------------------------------------------------
    | Boot
    |--------------------------------------------------------------------------
    */

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->assigned_at) {
                $model->assigned_at = now();
            }
            if (auth()->check() && ! $model->assigned_by) {
                $model->assigned_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        static::deleting(function ($model) {
            if (auth()->check() && ! $model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
}