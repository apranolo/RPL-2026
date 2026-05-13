<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PembinaanReview extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'registration_id',
        'reviewer_id',
        'score',
        'feedback',
        'recommendation',
        'reviewed_at',
        'updated_by',
        'deleted_by',
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
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the registration this review belongs to
     */
    public function registration()
    {
        return $this->belongsTo(PembinaanRegistration::class);
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

    /**
     * Scope to filter by registration
     */
    public function scopeForRegistration($query, int $registrationId)
    {
        return $query->where('registration_id', $registrationId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get score label (if score exists)
     */
    public function getScoreLabelAttribute(): ?string
    {
        if (! $this->score) {
            return null;
        }

        if ($this->score >= 90) {
            return 'Excellent';
        } elseif ($this->score >= 80) {
            return 'Very Good';
        } elseif ($this->score >= 70) {
            return 'Good';
        } elseif ($this->score >= 60) {
            return 'Satisfactory';
        } else {
            return 'Needs Improvement';
        }
    }

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

        // Auto-fill updated_by on update
        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        // Auto-fill deleted_by on soft delete
        static::deleting(function ($model) {
            if (auth()->check() && ! $model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
}
