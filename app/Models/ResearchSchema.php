<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchSchema extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    // Relasi ke Proposal (1 schema punya banyak proposal)
    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }
}
