<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmissionFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'file_path',
        'file_type',
        'file_size',
    ];

    protected $appends = ['id_submission'];

    public function getIdSubmissionAttribute()
    {
        return $this->submission_id;
    }

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
