<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionFile extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'submission_id', // Menghubungkan ke entitas submission utama
        'file_path',     // Lokasi penyimpanan file fisik
        'file_type',     // Kategori Berkas: 'ManuscriptMain' atau 'Supplementary'
    ];

    /**
     * Mendefinisikan relasi inverse ke model Submission.
     * Setiap file unggahan pasti dimiliki oleh satu entitas submission.
     *
     * @return BelongsTo
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}