<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Submission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'abstract',
        'authors_display',
        'file_path',
        'original_filename',
        'status',
        'submitted_at',
        'cover_letter',
        'keywords',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submitted_at' => 'datetime',
        'keywords' => 'array',
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
     * Get the journal this submission belongs to
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the author (user) who submitted this manuscript
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get all editorial assignments for this submission
     */
    public function editorialAssignments()
    {
        return $this->hasMany(EditorialAssignment::class);
    }

    /**
     * Get the active editorial assignment
     */
    public function activeAssignment()
    {
        return $this->hasOne(EditorialAssignment::class)
            ->where('status', 'active');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get submissions with no editor assigned
     */
    public function scopeUnassigned($query)
    {
        return $query->whereDoesntHave('editorialAssignments', function ($q) {
            $q->whereIn('status', ['pending', 'active']);
        });
    }

    /**
     * Scope to get submissions actively being handled by an editor
     */
    public function scopeActiveForEditor($query, int $editorId)
    {
        return $query->whereHas('editorialAssignments', function ($q) use ($editorId) {
            $q->where('editor_id', $editorId)
                ->where('status', 'active');
        });
    }

    /**
     * Scope to get submissions awaiting confirmation (pending assignment acceptance)
     */
    public function scopeAwaitingConfirmation($query, int $editorId)
    {
        return $query->whereHas('editorialAssignments', function ($q) use ($editorId) {
            $q->where('editor_id', $editorId)
                ->where('status', 'pending');
        });
    }

    /**
     * Scope to filter by journal
     */
    public function scopeForJournal($query, int $journalId)
    {
        return $query->where('journal_id', $journalId);
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

    /**
     * Scope to search submissions
     */
    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('authors_display', 'like', "%{$search}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'submitted' => 'Submitted',
            'under_review' => 'Under Review',
            'revision_required' => 'Revision Required',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected',
            'withdrawn' => 'Withdrawn',
            default => $this->status,
        };
    }

    /**
     * Get status color for badge
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'submitted' => 'blue',
            'under_review' => 'yellow',
            'revision_required' => 'orange',
            'accepted' => 'green',
            'rejected' => 'red',
            'withdrawn' => 'gray',
            default => 'gray',
        };
    }
}
