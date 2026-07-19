<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResearchOutput extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'research_outputs';

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

    protected $appends = ['id_contract', 'doi', 'no_paten', 'isbn', 'tautan_publikasi'];

    public function getIdContractAttribute()
    {
        return $this->contract_id;
    }

    public function getDoiAttribute()
    {
        return $this->jenis_luaran === 'Jurnal' && $this->outputable ? $this->outputable->doi : null;
    }

    public function getNoPatenAttribute()
    {
        return $this->jenis_luaran === 'HKI' && $this->outputable ? $this->outputable->patent_number : null;
    }

    public function getIsbnAttribute()
    {
        return $this->jenis_luaran === 'Buku' && $this->outputable ? $this->outputable->isbn : null;
    }

    public function getTautanPublikasiAttribute($value)
    {
        if ($this->jenis_luaran === 'Jurnal' && $this->outputable) {
            return $this->outputable->url ?? $value;
        }
        return $value;
    }

    protected $fillable = [
        'contract_id',
        'user_id',
        'jenis_luaran',
        'judul_luaran',
        'tahun_capaian',
        'penulis_atau_pencipta',
        'file_sertifikat_atau_cover',
        'status_verifikasi',
        'keterangan',
        'tautan_publikasi',
        'outputable_type',
        'outputable_id',
        // Kolom tambahan untuk fitur report
        'title',
        'type', // Jurnal/Buku/HKI/Produk
        'year',
        'status', // Status verifikasi
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
