<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Galley extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'submission_id',
        'issue_id',
        'label',
        'file_path',
        'page_from',
        'page_to',
        'doi',
        'sequence',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'page_from' => 'integer',
        'page_to' => 'integer',
        'sequence' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'file_url',
        'id_submission',
        'id_issue',
        'pages',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    |
    */

    /**
     * Get the issue that this galley belongs to.
     */
    public function issue()
    {
        return $this->belongsTo(Issue::class);
    }

    /**
     * Get the submission that this galley represents.
     */
    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    |
    */

    /**
     * Get the file URL.
     */
    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::url($this->file_path);
    }

    /**
     * Get id_submission (alias for submission_id).
     */
    public function getIdSubmissionAttribute(): ?int
    {
        return $this->submission_id;
    }

    /**
     * Set id_submission (alias for submission_id).
     */
    public function setIdSubmissionAttribute($value): void
    {
        $this->attributes['submission_id'] = $value;
    }

    /**
     * Get id_issue (alias for issue_id).
     */
    public function getIdIssueAttribute(): ?int
    {
        return $this->issue_id;
    }

    /**
     * Set id_issue (alias for issue_id).
     */
    public function setIdIssueAttribute($value): void
    {
        $this->attributes['issue_id'] = $value;
    }

    /**
     * Get pages (formatted page range).
     */
    public function getPagesAttribute(): ?string
    {
        if ($this->page_from === null && $this->page_to === null) {
            return null;
        }

        if ($this->page_from !== null && $this->page_to !== null) {
            if ($this->page_from === $this->page_to) {
                return (string) $this->page_from;
            }
            return "{$this->page_from}-{$this->page_to}";
        }

        return (string) ($this->page_from ?? $this->page_to);
    }
}

