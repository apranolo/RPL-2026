<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Issue extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_journal',
        'volume',
        'number',
        'year',
        'title',
        'description',
        'published_at',
        'status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'year' => 'integer',
        'volume' => 'integer',
        'number' => 'integer',
    ];

    public function journal()
    {
        return $this->belongsTo(Journal::class, 'id_journal');
    }

    public function galleys()
    {
        return $this->hasMany(Galley::class, 'id_issue');
    }
}