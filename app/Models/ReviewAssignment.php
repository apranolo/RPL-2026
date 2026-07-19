<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'reviewer_id',
        'assigner_id',
        'round',
        'status',
        'assigned_at',
        'due_date',
        'decline_reason',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    protected $appends = ['id_submission', 'id_reviewer', 'reviewer_name'];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigner_id');
    }

    public function forms(): HasMany
    {
        return $this->hasMany(ReviewForm::class);
    }

    public function scopeForReviewer($query, $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
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
        return match ($this->status) {
            'assigned' => 'amber',
            'in_progress' => 'blue',
            'Accepted' => 'green',
            'Declined' => 'red',
            'completed' => 'emerald',
            default => 'gray',
        };
    }

    public function getIdSubmissionAttribute()
    {
        return $this->submission_id;
    }

    public function getIdReviewerAttribute()
    {
        return $this->reviewer_id;
    }

    public function getReviewerNameAttribute()
    {
        return $this->reviewer ? $this->reviewer->name : '';
    }
}
