<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'journal_id', // Menghilangkan blocker arsitektural multi-tenancy
        'user_id',    // Relasi ke Author/Pengaju
        'title',
        'abstract',   // Metadata wajib sesuai PRD Modul 2
        'keywords',   // Metadata wajib sesuai PRD Modul 2
        'status',     // OJS Lifecycle: draft, pending, in_review, copyediting, rejected, published
    ];

    /**
     * Mendefinisikan relasi ke model Journal (Multi-tenancy).
     * Setiap submission terikat pada satu Journal tujuan.
     *
     * @return BelongsTo
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Mendefinisikan relasi ke model User (Author/Pengaju).
     * Setiap submission diajukan oleh satu User.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendefinisikan relasi ke model SubmissionFile.
     * Satu submission dapat memiliki banyak berkas (naskah utama, dokumen pendukung, dll.).
     *
     * @return HasMany
     */
    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }
}