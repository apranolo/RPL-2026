<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'user_id',
        'title',
        'content',
        'progress_percentage',
        'report_period',
        'attachment_path',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'progress_percentage' => 'integer',
            'submitted_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the proposal this report belongs to.
     */
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Get the user (dosen) who created this report.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all evaluations for this report.
     */
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
