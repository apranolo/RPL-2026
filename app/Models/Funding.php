<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Funding extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PLANNED = 'planned';

    public const STATUS_REQUESTED = 'requested';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_DISBURSED = 'disbursed';

    public const STATUS_CANCELLED = 'cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'contract_id',
        'funding_number',
        'description',
        'amount',
        'percentage',
        'status',
        'funding_date',
        'due_date',
        'paid_at',
        'payment_method',
        'reference_number',
        'proof_document_path',
        'notes',
        'created_by',
        'approved_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'funding_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'id_contract',
        'termin_number',
        'status_pencairan',
        'bukti_transfer_path',
        'cair_at',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    // public function payments(): HasMany
    // {
    //     return $this->hasMany(Payment::class);
    // }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByStatus(Builder $query, ?string $status): Builder
    {
        if (! $status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeDisbursed(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DISBURSED);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helpers
    |--------------------------------------------------------------------------
    */

    public function getIdContractAttribute(): int
    {
        return $this->contract_id;
    }

    public function getTerminNumberAttribute(): int
    {
        preg_match('/\d+/', (string) $this->funding_number, $matches);

        return isset($matches[0]) ? (int) $matches[0] : 0;
    }

    public function getStatusPencairanAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PLANNED => 'Belum_Cair',
            self::STATUS_REQUESTED, self::STATUS_APPROVED => 'Proses_Transfer',
            self::STATUS_DISBURSED => 'Sudah_Cair',
            default => 'Belum_Cair',
        };
    }

    public function getBuktiTransferPathAttribute()
    {
        return $this->proof_document_path;
    }

    public function getCairAtAttribute()
    {
        return $this->paid_at ? $this->paid_at->toIso8601String() : null;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::getStatusOptions()[$this->status] ?? $this->status;
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_REQUESTED => 'yellow',
            self::STATUS_APPROVED => 'blue',
            self::STATUS_DISBURSED => 'green',
            self::STATUS_CANCELLED => 'red',
            default => 'gray',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_PLANNED => 'Direncanakan',
            self::STATUS_REQUESTED => 'Diajukan',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_DISBURSED => 'Dicairkan',
            self::STATUS_CANCELLED => 'Dibatalkan',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Funding $funding) {
            if (Auth::check() && ! $funding->created_by) {
                $funding->created_by = Auth::id();
            }
        });
    }
}
