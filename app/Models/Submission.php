<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'status',
    ];

    /**
     * Relation to author (User)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Relation to Journal
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
