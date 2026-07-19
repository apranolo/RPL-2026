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
        'id_submission', // HEAD compatibility
        'id_issue',      // HEAD compatibility
        'submission_id',
        'issue_id',
        'label',
        'file_path',
        'pages',
        'doi',
        'sequence',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
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
        'file_extension',
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
        return $this->belongsTo(Issue::class, 'issue_id');
    }

    /**
     * Get the submission that this galley represents.
     */
    public function submission()
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
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
     * Get file extension (lowercase of the label, e.g., 'pdf').
     */
    public function getFileExtensionAttribute(): string
    {
        return strtolower($this->label);
    }
}
