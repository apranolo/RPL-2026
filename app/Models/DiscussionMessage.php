<?php

namespace App\Models;

use App\Models\SubmissionDiscussion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscussionMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'submission_discussion_id',
        'user_id',
        'parent_message_id',
        'message',
        'attachment',
    ];

    public function discussion()
    {
        return $this->belongsTo(
            SubmissionDiscussion::class,
            'submission_discussion_id'
        );
    }

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function parentMessage()
    {
        return $this->belongsTo(
            DiscussionMessage::class,
            'parent_message_id'
        );
    }

    public function replies()
    {
        return $this->hasMany(
            DiscussionMessage::class,
            'parent_message_id'
        );
    }
}