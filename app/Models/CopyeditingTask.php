<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CopyeditingTask extends Model
{
    use HasFactory;

    protected $table = 'copyediting_tasks';

    protected $primaryKey = 'id_task';

    protected $fillable = [
        'id_submission',
        'id_copyeditor',
        'status',
        'editor_note',
        'copyeditor_note',
        'assigned_at',
        'completed_at',
        'original_file_path',
        'original_file_name',
        'copyedited_file_path',
        'copyedited_file_name',
        'author_approval_notes',
        'author_approved_at',
    ];

    protected $casts = [
        'assigned_at'        => 'datetime',
        'completed_at'       => 'datetime',
        'author_approved_at' => 'datetime',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id');
    }

    public function copyeditor()
    {
        return $this->belongsTo(User::class, 'id_copyeditor', 'id');
    }

    public function isAssigned(): bool       { return $this->status === 'Assigned'; }
    public function isInProgress(): bool     { return $this->status === 'In_Progress'; }
    public function isCompleted(): bool      { return $this->status === 'Completed'; }
    public function isAuthorApproved(): bool { return $this->status === 'Author_Approved'; }
}
