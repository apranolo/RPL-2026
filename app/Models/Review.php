<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'reviews';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'proposal_id',
        'reviewer_id',
        'score',
        'feedback',
        'recommendation',
        'reviewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the proposal being reviewed
     */
    protected $fillable = [
        'proposal_id',
        'reviewer_id',
        'status',
        'notes',
        'start_date',
        'end_date',
        'total_score',
        'recommendation',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Get the reviewer who wrote this review
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter by reviewer
     */
    public function scopeByReviewer($query, int $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if review has feedback
     */
    public function hasFeedback(): bool
    {
        return ! empty($this->feedback);
    }

    /**
     * Check if review has recommendation
     */
    public function hasRecommendation(): bool
    {
        return ! empty($this->recommendation);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set reviewed_at on create
        static::creating(function ($model) {
            if (! $model->reviewed_at) {
                $model->reviewed_at = now();
            }
        });
    public function assessmentCriteria()
    {
        return $this->hasMany(AssessmentCriteria::class, 'review_id');
    }
}
