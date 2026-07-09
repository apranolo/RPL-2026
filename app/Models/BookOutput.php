<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookOutput extends Model
{
    protected $fillable = ['isbn', 'publisher', 'pages'];

    /**
     * Mendapatkan entitas induk luaran.
     */
    public function researchOutput()
    {
        return $this->morphOne(ResearchOutput::class, 'outputable');
    }
}
