<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'contract_number',
        'title',
        'pembinaan_registration_id',
        'journal_id',
        'university_id',
        'start_date',
        'end_date',
        'status',
        'terms',
        'notes',
        'contract_value',
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
        'start_date' => 'date',
        'end_date' => 'date',
        'contract_value' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /** Pembinaan registration this contract is linked to. */
    public function pembinaanRegistration()
    {
        return $this->belongsTo(PembinaanRegistration::class);
    }

    /** Journal this contract is linked to. */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /** University this contract is linked to. */
    public function university()
    {
        return $this->belongsTo(University::class);
    }

    /** User who created this contract. */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** User who last updated this contract. */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /** Only draft contracts. */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /** Only active contracts. */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /** Only completed contracts. */
    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helper Methods
    |--------------------------------------------------------------------------
    */

    /** Human-readable status label (Indonesian). */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'active' => 'Aktif',
            'selesai' => 'Selesai',
            'dibatalkan' => 'Dibatalkan',
            default => $this->status,
        };
    }

    /** Badge colour mapped to shadcn/ui variant names. */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'secondary',
            'active' => 'success',
            'selesai' => 'default',
            'dibatalkan' => 'destructive',
            default => 'default',
        };
    }

    /** Whether the contract is still in draft state. */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /** Whether the contract is currently active. */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /*
    |--------------------------------------------------------------------------
    | Auto-generated Contract Number
    |--------------------------------------------------------------------------
    */

    /**
     * Generate a sequential contract number in the format KON-{YEAR}-{XXXX}.
     * E.g. KON-2026-0001
     */
    public static function generateContractNumber(): string
    {
        $year = now()->year;
        $prefix = "KON-{$year}-";

        $lastContract = static::withTrashed()
            ->where('contract_number', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $sequence = 1;

        if ($lastContract && $lastContract->contract_number) {
            $parts = explode('-', $lastContract->contract_number);
            $sequence = ((int) end($parts)) + 1;
        }

        return $prefix.str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /*
    |--------------------------------------------------------------------------
    | Model Events
    |--------------------------------------------------------------------------
    */

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Contract $model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });

        static::updating(function (Contract $model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        static::deleting(function (Contract $model) {
            if (auth()->check() && ! $model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
}
