<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'abstract',
        'keywords',
        'status',
    ];

    /**
     * Get the journal that owns this submission
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }
}
