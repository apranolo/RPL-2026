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
        'file_path',
        'status', // unassigned, active, awaiting_decision, archived
    ];

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function assignments()
    {
        return $this->hasMany(EditorialAssignment::class);
    }

    public function decisions()
    {
        return $this->hasMany(EditorialDecision::class);
    }
}
