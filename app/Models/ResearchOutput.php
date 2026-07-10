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

    protected $appends = ['id_proposal', 'doi', 'no_paten', 'isbn', 'tautan_publikasi'];

    public function getIdProposalAttribute()
    {
        return $this->proposal_id;
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

    public function getTautanPublikasiAttribute()
    {
        return $this->jenis_luaran === 'Jurnal' && $this->outputable ? $this->outputable->url : null;
    }

    protected $fillable = [
        'proposal_id',
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

    // Relasi ke Proposal
    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Relasi Polymorphic untuk mendapatkan detail spesifik tipe luaran.
     */
    public function outputable(): MorphTo
    {
        return $this->morphTo();
    }
}