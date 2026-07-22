<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'abstract',
        'keywords',
        'status',
        'file_path',
        'author_notes',
    ];

    protected $appends = [
        'user_id',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }

    public function contributors(): HasMany
    {
        return $this->hasMany(SubmissionContributor::class);
    }

    public function revisionRounds(): HasMany
    {
        return $this->hasMany(RevisionRound::class, 'id_submission', 'id');
    }

    public function copyeditingTask(): HasOne
    {
        return $this->hasOne(CopyeditingTask::class, 'id_submission', 'id');
    }

    public function getUserIdAttribute(): ?int
    {
        return $this->author_id;
    }

    public function setUserIdAttribute($value): void
    {
        $this->attributes['author_id'] = $value;
    }
}
