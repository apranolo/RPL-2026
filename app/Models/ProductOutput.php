<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductOutput extends Model
{
    protected $fillable = ['partner_institution', 'benefits_description'];

    /**
     * Mendapatkan entitas induk luaran.
     */
    public function researchOutput()
    {
        return $this->morphOne(ResearchOutput::class, 'outputable');
    }
}