<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'reviewer_id',
        'assigner_id',
        'status',
        'assigned_at',
        'decline_reason',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigner_id');
    }

    public function scopeForReviewer($query, $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'assigned' => 'Menunggu Dimulai',
            'in_progress' => 'Sedang Direview',
            'Accepted' => 'Diterima',
            'Declined' => 'Ditolak',
            'completed' => 'Selesai',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'assigned' => 'amber',
            'in_progress' => 'blue',
            'Accepted' => 'green',
            'Declined' => 'red',
            'completed' => 'emerald',
            default => 'gray',
        };
    }
}
