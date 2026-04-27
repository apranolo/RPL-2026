<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'user_id',
        'research_schema_id',

    ];

    // Relasi ke User (Dosen)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function researchSchema()
    {
        return $this->belongsTo(ResearchSchema::class);
    }
}
