<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'volume',
        'number',
        'year',
        'title',
        'description',
        'publication_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'volume' => 'integer',
        'number' => 'integer',
        'year' => 'integer',
        'publication_date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that owns this issue.
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the galleys published in this issue.
     */
    public function galleys()
    {
        return $this->hasMany(Galley::class);
    }
}
