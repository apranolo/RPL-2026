<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Galley extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_submission',
        'id_issue',
        'label',
        'file_path',
        'page_from',
        'page_to',
        'doi',
        'sequence',
    ];

    protected $casts = [
        'page_from' => 'integer',
        'page_to' => 'integer',
        'sequence' => 'integer',
    ];

    public function issue()
    {
        return $this->belongsTo(Issue::class, 'id_issue');
    }

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission');
    }
}