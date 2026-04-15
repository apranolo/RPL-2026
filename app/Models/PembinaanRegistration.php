<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class PembinaanRegistration extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pembinaan_id',
        'journal_id',
        'user_id',
        'status',
        'registered_at',
        'reviewed_at',
        'reviewed_by',
        'rejection_reason',
        'supporting_document',
        'updated_by',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'registered_at' => 'datetime',
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
     * Get the pembinaan this registration belongs to
     */
    public function pembinaan()
    {
        return $this->belongsTo(Pembinaan::class);
    }

    /**
     * Get the journal for this registration
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the user who registered
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewer who reviewed this registration
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get all attachments for this registration
     */
    public function attachments()
    {
        return $this->hasMany(PembinaanRegistrationAttachment::class, 'registration_id');
    }

    /**
     * Get all reviews for this registration
     */
    public function reviews()
    {
        return $this->hasMany(PembinaanReview::class, 'registration_id');
    }

    /**
     * Get reviewer assignments
     */
    public function reviewerAssignments()
    {
        return $this->hasMany(ReviewerAssignment::class, 'registration_id');
    }

    /**
     * Get the assessment linked to this registration
     */
    public function assessment()
    {
        return $this->hasOne(JournalAssessment::class, 'pembinaan_registration_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only pending registrations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get only approved registrations
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get only rejected registrations
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by university
     *
     * Accepts nullable int to prevent TypeError when user has no university assigned.
     * Returns empty result set when universityId is null to avoid data leakage.
     */
    public function scopeForUniversity($query, ?int $universityId)
    {
        if (is_null($universityId)) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('journal', function ($q) use ($universityId) {
            $q->where('university_id', $universityId);
        });
    }

    /**
     * Scope to filter by pembinaan
     */
    public function scopeForPembinaan($query, int $pembinaanId)
    {
        return $query->where('pembinaan_id', $pembinaanId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if registration is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if registration is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if registration is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default => $this->status,
        };
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'destructive',
            default => 'default',
        };
    }

    /**
     * Check if registration can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if supporting document exists.
     */
    public function hasSupportingDocument(): bool
    {
        return ! empty($this->supporting_document) && Storage::disk('public')->exists($this->supporting_document);
    }

    /**
     * Get supporting document download URL.
     */
    public function getSupportingDocumentUrlAttribute(): ?string
    {
        if (! $this->hasSupportingDocument()) {
            return null;
        }

        return Storage::disk('public')->url($this->supporting_document);
    }

    /**
     * Get supporting document filename.
     */
    public function getSupportingDocumentFilenameAttribute(): ?string
    {
        if (empty($this->supporting_document)) {
            return null;
        }

        return basename($this->supporting_document);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set registered_at on create
        static::creating(function ($model) {
            if (! $model->registered_at) {
                $model->registered_at = now();
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
