<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * JournalReassignment Model
 *
 * Audit log for tracking journal manager reassignments.
 * Records when LPPM transfers journal ownership from one user to another.
 *
 * Key Features:
 * - Immutable audit trail (no soft deletes)
 * - Preserves history even if users are deleted (nullable FKs)
 * - Optional reason field for documentation
 * - Automatic timestamps
 *
 * @property int $id
 * @property int $journal_id
 * @property int|null $from_user_id
 * @property int|null $to_user_id
 * @property int|null $reassigned_by
 * @property string|null $reason
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class JournalReassignment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'journal_reassignments';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'from_user_id',
        'to_user_id',
        'reassigned_by',
        'reason',
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
     * Get the journal that was reassigned
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the previous journal manager (before reassignment)
     */
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * Get the new journal manager (after reassignment)
     */
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    /**
     * Get the LPPM admin who performed the reassignment
     */
    public function reassignedBy()
    {
        return $this->belongsTo(User::class, 'reassigned_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get reassignments for a specific journal
     */
    public function scopeForJournal($query, int $journalId)
    {
        return $query->where('journal_id', $journalId);
    }

    /**
     * Scope to get reassignments from a specific user
     */
    public function scopeFromUser($query, int $userId)
    {
        return $query->where('from_user_id', $userId);
    }

    /**
     * Scope to get reassignments to a specific user
     */
    public function scopeToUser($query, int $userId)
    {
        return $query->where('to_user_id', $userId);
    }

    /**
     * Scope to get reassignments performed by a specific LPPM admin
     */
    public function scopeByReassigner($query, int $userId)
    {
        return $query->where('reassigned_by', $userId);
    }

    /**
     * Scope to get recent reassignments
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope to order by most recent first
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
