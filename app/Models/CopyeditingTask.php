<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model CopyeditingTask untuk proses copyediting naskah ajuan.
 * Entitas resmi akan diselaraskan dengan model Septian Eko Nugroho.
 */
class CopyeditingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'copyeditor_id',
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
        'copyedited_at'      => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function copyeditor()
    {
        return $this->belongsTo(User::class, 'copyeditor_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Status Helpers
    |--------------------------------------------------------------------------
    */

    public function isAssigned(): bool       { return $this->status === 'Assigned'; }
    public function isInProgress(): bool     { return $this->status === 'In_Progress'; }
    public function isCompleted(): bool      { return $this->status === 'Completed'; }
    public function isAuthorApproved(): bool { return $this->status === 'Author_Approved'; }
}
