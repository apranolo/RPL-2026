<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'author_id',
        'title',
        'abstract',
        'file_path',
        'status', // unassigned, active, awaiting_decision, archived
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that this submission belongs to.
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the author of this submission.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get the galleys for this submission.
     */
    public function galleys()
    {
        return $this->hasMany(Galley::class);
    }
}
