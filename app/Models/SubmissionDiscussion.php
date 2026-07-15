<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubmissionDiscussion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'submission_id',
        'stage',
        'subject',
    ];

    public function messages()
    {
        return $this->hasMany(
            DiscussionMessage::class,
            'submission_discussion_id'
        );
    }

    public function submission()
    {
        return $this->belongsTo(
            Submission::class,
            'submission_id'
        );
    }
}
