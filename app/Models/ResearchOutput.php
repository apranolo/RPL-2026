<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ResearchOutput extends Model
{
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
    ];

    protected $fillable = [
        'proposal_id',
        'user_id',
        'kategori',
        'judul',
        'file_path',
        'status',
        'keterangan',
        'outputable_id',
        'outputable_type',
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

    public function outputable(): MorphTo
    {
        return $this->morphTo();
    }
}
