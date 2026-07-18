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
        'draft'     => 'Draft',
        'submitted' => 'Submitted',
        'approved'  => 'Approved',
        'rejected'  => 'Rejected',
        'published' => 'Published',
        'patented'  => 'Patented',
    ];

    protected $fillable = [
        'proposal_id',
        'user_id',
        'kategori',
        'judul',
        'file_path',
        'status',
        'keterangan',
        'tkt_level',
        'version',
        'year',
        'url',
        'cover_image',
        'document',
        'outputable_type',
        'outputable_id',
        'title',
        'type',
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
}
