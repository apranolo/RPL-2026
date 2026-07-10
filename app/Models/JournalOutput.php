<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalOutput extends Model
{
    protected $fillable = ['doi', 'journal_name', 'volume', 'number', 'url'];

    /**
     * Mendapatkan entitas induk luaran.
     */
    public function researchOutput()
    {
        return $this->morphOne(ResearchOutput::class, 'outputable');
    }
}