<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Output extends Model
{
    use HasFactory;

    /**
     * Output type constants
     */
    public const TYPE_PUBLIKASI_JURNAL = 'publikasi_jurnal';

    public const TYPE_HKI = 'hki';

    public const TYPE_BUKU = 'buku';

    public const TYPE_PROSIDING = 'prosiding';

    /**
     * Status constants
     */
    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_VERIFIED = 'verified';

    protected $fillable = [
        'user_id',
        'journal_id',
        'type',
        'title',
        'authors',
        'year',
        'doi',
        'url',
        'journal_name',
        'volume',
        'issue',
        'pages',
        'issn',
        'e_issn',
        'publisher',
        'file_path',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    /**
     * Get all available output types.
     */
    public static function getTypeOptions(): array
    {
        return [
            self::TYPE_PUBLIKASI_JURNAL => 'Publikasi Jurnal Ilmiah',
            self::TYPE_HKI => 'Hak Kekayaan Intelektual (HKI)',
            self::TYPE_BUKU => 'Buku',
            self::TYPE_PROSIDING => 'Prosiding',
        ];
    }

    /**
     * Get the user that owns the output.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the journal associated with the output.
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the human-readable type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return self::getTypeOptions()[$this->type] ?? $this->type;
    }

    /**
     * Get the human-readable status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Diajukan',
            self::STATUS_VERIFIED => 'Terverifikasi',
            default => $this->status,
        };
    }
}
