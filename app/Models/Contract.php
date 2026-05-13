<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Research Contract (Kontrak Penelitian) model.
 *
 * Represents a contract generated from an approved PembinaanRegistration.
 *
 * @property int         $id
 * @property int         $registration_id
 * @property string      $contract_number       Format: SPK-YYYY-XXXXX
 * @property float|null  $nilai_kontrak          Contract value in IDR
 * @property string|null $tanggal_mulai          Start date
 * @property string|null $tanggal_selesai        End date
 * @property string|null $catatan                Notes / remarks
 * @property string      $status                 draft | aktif | selesai | batal
 * @property int|null    $generated_by           User who generated the contract
 * @property int|null    $updated_by             User who last updated the status
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read PembinaanRegistration $registration
 * @property-read User|null             $generatedBy
 * @property-read User|null             $updatedBy
 */
class Contract extends Model
{
    use HasFactory;

    // Status constants
    public const STATUS_DRAFT   = 'draft';
    public const STATUS_AKTIF   = 'aktif';
    public const STATUS_SELESAI = 'selesai';
    public const STATUS_BATAL   = 'batal';

    protected $fillable = [
        'registration_id',
        'contract_number',
        'nilai_kontrak',
        'tanggal_mulai',
        'tanggal_selesai',
        'catatan',
        'status',
        'generated_by',
        'updated_by',
    ];

    protected $casts = [
        'nilai_kontrak'   => 'decimal:2',
        'tanggal_mulai'   => 'date',
        'tanggal_selesai' => 'date',
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────────────────────────────────────

    public function registration(): BelongsTo
    {
        return $this->belongsTo(PembinaanRegistration::class, 'registration_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Human-readable label map for statuses.
     */
    public static function statusLabels(): array
    {
        return [
            self::STATUS_DRAFT   => 'Draft',
            self::STATUS_AKTIF   => 'Aktif',
            self::STATUS_SELESAI => 'Selesai',
            self::STATUS_BATAL   => 'Dibatalkan',
        ];
    }

    /**
     * Returns the human-readable label for current status.
     */
    public function getStatusLabelAttribute(): string
    {
        return self::statusLabels()[$this->status] ?? ucfirst($this->status);
    }

    /**
     * Check if contract is in a terminal (immutable) state.
     */
    public function isTerminal(): bool
    {
        return in_array($this->status, [self::STATUS_SELESAI, self::STATUS_BATAL]);
    }

    /**
     * Format nilai_kontrak as Rupiah string.
     */
    public function getNilaiKontrakFormattedAttribute(): string
    {
        if ($this->nilai_kontrak === null) {
            return '-';
        }

        return 'Rp ' . number_format((float) $this->nilai_kontrak, 0, ',', '.');
    }
}
