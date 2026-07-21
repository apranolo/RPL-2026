<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class JournalOutput extends Model
{
    protected $fillable = [
        'journal_id',
        'title',
        'authors',
        'year',
        'doi',
        'url',
        'journal_name',
        'volume',
        'issue',
        'pages',
        'issn',
        'e_issn',
        'publisher',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    public function researchOutput(): MorphOne
    {
        return $this->morphOne(ResearchOutput::class, 'outputable');
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
