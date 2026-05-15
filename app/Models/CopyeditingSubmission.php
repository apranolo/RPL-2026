<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CopyeditingSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'copyeditor_id',
        'author_id',
        'original_file_path',
        'original_file_name',
        'copyedited_file_path',
        'copyedited_file_name',
        'copyeditor_notes',
        'status',
        'author_approval_notes',
        'author_approved_at',
        'copyedited_at',
    ];

    protected $casts = [
        'author_approved_at' => 'datetime',
        'copyedited_at' => 'datetime',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function copyeditor()
    {
        return $this->belongsTo(User::class, 'copyeditor_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isWaitingApproval(): bool
    {
        return $this->status === 'waiting_approval';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}
