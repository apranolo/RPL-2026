<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ResearchOutput extends Model
{
    use SoftDeletes;

    // Kategori statis
    const KATEGORI = [
        'Jurnal' => 'Jurnal Ilmiah',
        'Buku' => 'Buku / Modul',
        'HKI' => 'HKI / Paten',
        'Produk' => 'Produk / Prototipe',
    ];

    const STATUS = [
        'Draft' => 'Draft',
        'Menunggu_Verifikasi' => 'Menunggu Verifikasi',
        'Terverifikasi_LPPM' => 'Terverifikasi LPPM',
        'Ditolak' => 'Ditolak',
    ];

    protected $fillable = [
        'contract_id',
        'user_id',
        'jenis_luaran',
        'judul_luaran',
        'tahun_capaian',
        'file_sertifikat_atau_cover',
        'status_verifikasi',
        'keterangan',
        'outputable_type',
        'outputable_id',
    ];

    // Relasi ke User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Contract
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Relasi Polymorphic untuk mendapatkan detail spesifik tipe luaran.
     */
    public function outputable(): MorphTo
    {
        return $this->morphTo();
    }
}
