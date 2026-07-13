<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model EditorialAssignment
 *
 * Merepresentasikan penugasan Section Editor ke sebuah Submission naskah.
 *
 * @property int         $id
 * @property int         $editor_id
 * @property int         $submission_id
 * @property int         $assigned_by
 * @property string      $assigned_at
 * @property string      $status
 */
class EditorialAssignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'editor_id',
        'submission_id',
        'assigned_by',
        'assigned_at',
        'status',
        'updated_by',
        'deleted_by',
    ];

    /**
     * Append virtual attributes for frontend backward compatibility.
     * Frontend expects id_submission and id_editor,
     * while the database columns are submission_id and editor_id.
     */
    protected $appends = [
        'id_submission',
        'id_editor',
    ];

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

    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors (Backward Compatibility)
    |--------------------------------------------------------------------------
    */

    /**
     * Accessor: id_submission → maps to submission_id column.
     * Required for frontend components that reference id_submission.
     */
    public function getIdSubmissionAttribute(): ?int
    {
        return $this->submission_id;
    }

    /**
     * Accessor: id_editor → maps to editor_id column.
     * Required for frontend components that reference id_editor.
     */
    public function getIdEditorAttribute(): ?int
    {
        return $this->editor_id;
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

    public function scopeForSubmission($query, int $submissionId)
    {
        return $query->where('submission_id', $submissionId);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
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