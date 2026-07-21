<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model ResearchOutput
 *
 * Merepresentasikan satu record luaran penelitian (jurnal, buku, HKI, produk/prototipe).
 * Tabel: `outputs`
 *
 * RBAC CONTRACT: kolom `user_id` selalu diisi dari Auth::id() di controller,
 * tidak pernah diterima dari raw request input.
 *
 * Kolom produk/prototipe yang disimpan langsung di tabel ini (flat schema):
 *   tkt_level, version, year, url, cover_image, document
 */
class ResearchOutput extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'outputs';

    // Kategori statis
    const KATEGORI = [
        'jurnal' => 'Jurnal',
        'buku' => 'Buku',
        'hki' => 'HKI',
        'prosiding' => 'Prosiding',
        'produk' => 'Produk/Prototipe',
    ];

    const STATUS = [
        'draft' => 'Draft',
        'submitted' => 'Submitted',
        'approved' => 'Approved',
        'rejected' => 'Rejected',
        'published' => 'Published',
        'patented' => 'Patented',
    ];

    /**
     * Mass-assignable attributes.
     *
     * Catatan: 'user_id' ada di sini agar create([...]) bisa berjalan,
     * tapi nilai-nya selalu diikat ke Auth::id() di controller (RBAC).
     */
    protected $fillable = [
        // ── Relasi ──────────────────────────────────────────────────────────
        'user_id',
        'proposal_id',

        // ── Kolom Dasar Luaran ───────────────────────────────────────────────
        'kategori',
        'judul',
        'keterangan',
        'file_path',
        'status',

        // ── Kolom Produk / Prototipe ─────────────────────────────────────────
        'tkt_level',    // integer 1–9 (Tingkat Kesiapan Teknologi)
        'version',      // string, mis. "v1.0"
        'year',         // integer, tahun capaian
        'url',          // URL repositori / referensi
        'cover_image',  // path relatif di public disk
        'document',     // path relatif di public disk (bukti luaran)

        // ── Polymorphic (HKI / Buku via morph) ──────────────────────────────
        'outputable_type',
        'outputable_id',
    ];

    /**
     * Attribute casting — pastikan tkt_level dan year selalu integer.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tkt_level' => 'integer',
        'year' => 'integer',
    ];

    // ── Relasi ────────────────────────────────────────────────────────────────

    /** Pemilik luaran ini (User yang login saat create). */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Proposal riset yang menghasilkan luaran ini (nullable untuk produk mandiri). */
    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }
}
