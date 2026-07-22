<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionIssue extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'volume',
        'nomor',
        'tahun',
        'judul_tematik',
        'deskripsi',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tahun' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that owns this production issue.
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter by journal.
     */
    public function scopeForJournal($query, int $journalId)
    {
        return $query->where('journal_id', $journalId);
    }

    /**
     * Scope to filter by year.
     */
    public function scopeByTahun($query, int $tahun)
    {
        return $query->where('tahun', $tahun);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to order by latest issue.
     */
    public function scopeLatestIssue($query)
    {
        return $query->orderByDesc('tahun')
            ->orderByDesc('volume')
            ->orderByDesc('nomor');
    }
}
