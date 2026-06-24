<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Galley extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'submission_id',
        'issue_id',
        'label',
        'file_path',
        'page_from',
        'page_to',
        'doi',
        'sequence',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'page_from' => 'integer',
        'page_to' => 'integer',
        'sequence' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the issue that this galley belongs to.
     */
    public function issue()
    {
        return $this->belongsTo(Issue::class);
    }

    /**
     * Get the submission that this galley represents.
     */
    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
