<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentNote extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_assessment_id',
        'user_id',
        'author_role',
        'note_type',
        'content',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal assessment this note belongs to
     */
    public function journalAssessment()
    {
        return $this->belongsTo(JournalAssessment::class);
    }

    /**
     * Get the user who created this note
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter notes by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('note_type', $type);
    }

    /**
     * Scope to filter notes by role
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('author_role', $role);
    }

    /**
     * Scope to get notes ordered by creation date
     */
    public function scopeOrderedByDate($query, string $direction = 'asc')
    {
        return $query->orderBy('created_at', $direction);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Create a note for an assessment
     */
    public static function createNote(
        int $assessmentId,
        int $userId,
        string $authorRole,
        string $noteType,
        string $content
    ): self {
        return self::create([
            'journal_assessment_id' => $assessmentId,
            'user_id' => $userId,
            'author_role' => $authorRole,
            'note_type' => $noteType,
            'content' => $content,
        ]);
    }
}
