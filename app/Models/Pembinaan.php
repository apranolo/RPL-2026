<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembinaan extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'category',
        'accreditation_template_id',
        'registration_start',
        'registration_end',
        'assessment_start',
        'assessment_end',
        'quota',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'registration_start' => 'datetime',
        'registration_end' => 'datetime',
        'assessment_start' => 'datetime',
        'assessment_end' => 'datetime',
        'quota' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'approved_registrations_count',
        'pending_registrations_count',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pembinaan';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the accreditation template for this pembinaan
     */
    public function accreditationTemplate()
    {
        return $this->belongsTo(AccreditationTemplate::class);
    }

    /**
     * Get the user who created this pembinaan
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this pembinaan
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all registrations for this pembinaan
     */
    public function registrations()
    {
        return $this->hasMany(PembinaanRegistration::class);
    }

    /**
     * Get pending registrations
     */
    public function pendingRegistrations()
    {
        return $this->hasMany(PembinaanRegistration::class)->where('status', 'pending');
    }

    /**
     * Get approved registrations
     */
    public function approvedRegistrations()
    {
        return $this->hasMany(PembinaanRegistration::class)->where('status', 'approved');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active pembinaan
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get only draft pembinaan
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to get only closed pembinaan
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get open pembinaan (within registration period)
     */
    public function scopeOpen($query)
    {
        $now = now();

        return $query->where('status', 'active')
            ->where('registration_start', '<=', $now)
            ->where('registration_end', '>=', $now);
    }

    /**
     * Scope to get upcoming pembinaan (registration not started)
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'active')
            ->where('registration_start', '>', now());
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get the approved registrations count attribute
     */
    public function getApprovedRegistrationsCountAttribute(): int
    {
        return $this->approved_registrations_count ?? $this->approvedRegistrations()->count();
    }

    /**
     * Get the pending registrations count attribute
     */
    public function getPendingRegistrationsCountAttribute(): int
    {
        return $this->pending_registrations_count ?? $this->pendingRegistrations()->count();
    }

    /**
     * Check if registration is open
     */
    public function isRegistrationOpen(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();

        return $now->between($this->registration_start, $this->registration_end);
    }

    /**
     * Check if assessment period is active
     */
    public function isAssessmentActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();

        return $now->between($this->assessment_start, $this->assessment_end);
    }

    /**
     * Check if quota is full
     */
    public function isQuotaFull(): bool
    {
        if (! $this->quota) {
            return false;
        }

        return $this->approvedRegistrations()->count() >= $this->quota;
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'active' => 'Active',
            'closed' => 'Closed',
            default => $this->status,
        };
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'secondary',
            'active' => 'success',
            'closed' => 'default',
            default => 'default',
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'akreditasi' => 'Akreditasi',
            'indeksasi' => 'Indeksasi',
            default => $this->category,
        };
    }

    /**
     * Check if pembinaan can be deleted
     */
    public function canBeDeleted(): bool
    {
        // Cannot delete if has approved registrations
        return $this->approvedRegistrations()->count() === 0;
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-fill created_by on create
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
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
