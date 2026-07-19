<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
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



    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'user_id',
    ];

    /**
     * Relation to author (User)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Alias relation to user (User) for backward compatibility.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Relation to Journal (Multi-tenancy).
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Relation to SubmissionFile.
     */
    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }

    /**
     * Relation to SubmissionContributor.
     */
    public function contributors(): HasMany
    {
        return $this->hasMany(SubmissionContributor::class);
    }

    /**
     * Relation to RevisionRound.
     */
    public function revisionRounds(): HasMany
    {
        return $this->hasMany(RevisionRound::class, 'id_submission', 'id');
    }

    public function editorialDecisions(): HasMany
    {
        return $this->hasMany(EditorialDecision::class, 'submission_id');
    }

    /**
     * Accessor for user_id (alias for author_id).
     */
    public function getUserIdAttribute(): ?int
    {
        return $this->author_id;
    }

    /**
     * Mutator for user_id (alias for author_id).
     */
    public function setUserIdAttribute($value): void
    {
        $this->attributes['author_id'] = $value;
    }
}
