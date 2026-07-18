<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Stub model untuk Submission (naskah ilmiah ajuan OJS).
 * Model resmi akan dibuat oleh Dzaky Muayyad (PR #140).
 */
class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'abstract',
        'author_id',
        'journal_id',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function copyeditingTask()
    {
        return $this->hasOne(CopyeditingTask::class);
    }
}
