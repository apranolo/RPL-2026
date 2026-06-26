<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmissionContributor extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'name',
        'email',
        'affiliation',
        'is_corresponding',
    ];

    protected $casts = [
        'is_corresponding' => 'boolean',
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
