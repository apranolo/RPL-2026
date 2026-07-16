<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ResearchSchema Model
 *
 * Merepresentasikan skema / kategori penelitian yang tersedia di sistem.
 * Setiap Proposal wajib dikaitkan dengan satu ResearchSchema.
 *
 * @property int         $id
 * @property string      $name         Nama skema (misal: Penelitian Dasar, Penelitian Terapan)
 * @property string|null $description  Deskripsi singkat skema penelitian
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Proposal> $proposals
 */
class ResearchSchema extends Model
{
    use HasFactory;

    // ─── Fillable ────────────────────────────────────────────────────────────

    protected $fillable = [
        'name',
        'description',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    /**
     * Relasi ke Proposal.
     * Satu skema penelitian dapat dimiliki oleh banyak proposal.
     */
    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }
}
