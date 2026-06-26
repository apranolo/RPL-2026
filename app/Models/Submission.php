<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Submission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'abstract',
        'keywords',
        'language',
        'status',
    ];

    protected $casts = [
        'keywords' => 'array',
    ];

    protected $appends = ['id_user', 'id_journal'];

    public function getIdUserAttribute()
    {
        return $this->author_id;
    }

    public function getIdJournalAttribute()
    {
        return $this->journal_id;
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function contributors()
    {
        return $this->hasMany(SubmissionContributor::class);
    }

    public function files()
    {
        return $this->hasMany(SubmissionFile::class);
    }
}
