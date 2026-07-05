<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailTemplate extends Model
{
    protected $fillable = [
        'journal_id',
        'name',
        'event_trigger',
        'subject',
        'body',
        'variables',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables' => 'array',
    ];

    protected $appends = [
        'id_journal',
        'body_content',
    ];

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Accessor agar frontend menerima id_journal
     */
    public function getIdJournalAttribute()
    {
        return $this->journal_id;
    }

    /**
     * Accessor agar frontend menerima body_content
     */
    public function getBodyContentAttribute()
    {
        return $this->body;
    }
}
