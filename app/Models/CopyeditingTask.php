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

    public function isPending(): bool          { return $this->status === 'pending'; }
    public function isCopyediting(): bool      { return $this->status === 'copyediting'; }
    public function isWaitingApproval(): bool  { return $this->status === 'waiting_approval'; }
    public function isApproved(): bool         { return $this->status === 'approved'; }
    public function isRejected(): bool         { return $this->status === 'rejected'; }
}
