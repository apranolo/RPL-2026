<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citation extends Model
{
    protected $fillable = [
        'title',
        'author',
        'publication_year',
        'journal',
        'volume',
        'issue',
        'pages',
        'doi',
    ];
}
