<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HkiOutput extends Model
{
    protected $fillable = ['patent_number', 'patent_type', 'inventors'];

    /**
     * Mendapatkan entitas induk luaran.
     */
    public function researchOutput()
    {
        return $this->morphOne(ResearchOutput::class, 'outputable');
    }
}