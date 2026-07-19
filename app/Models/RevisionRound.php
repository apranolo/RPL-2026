<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RevisionRound extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_assessment_id',
        'round_number',
        'requested_by',
        'request_notes',
        'requested_at',
        'status',
    ];

    /**
     * Casting tipe atribut.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'round_number' => 'integer',
        'requested_at' => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
        'deleted_at'   => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relasi
    |--------------------------------------------------------------------------
    */

    /**
     * Assessment yang terkait dengan ronde revisi ini.
     */
    public function journalAssessment()
    {
        return $this->belongsTo(JournalAssessment::class);
    }

    /**
     * Pengguna (Admin Kampus/Reviewer) yang meminta revisi.
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * File-file yang dikirim oleh Author pada ronde revisi ini.
     */
    public function submissionFiles()
    {
        return $this->hasMany(SubmissionFile::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope untuk mendapatkan ronde terbaru terlebih dahulu.
     */
    public function scopeLatestRound($query)
    {
        return $query->orderBy('round_number', 'desc');
    }

    /**
     * Scope untuk memfilter berdasarkan status.
     */
    public function scopeByStatus($query, ?string $status)
    {
        if (! $status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessor & Helper
    |--------------------------------------------------------------------------
    */

    /**
     * Label status ronde revisi.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending'   => 'Menunggu Revisi',
            'submitted' => 'Revisi Dikirim',
            'accepted'  => 'Revisi Diterima',
            'rejected'  => 'Revisi Ditolak',
            default     => 'Tidak Diketahui',
        };
    }

    /**
     * Warna badge berdasarkan status.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending'   => 'yellow',
            'submitted' => 'blue',
            'accepted'  => 'green',
            'rejected'  => 'red',
            default     => 'gray',
        };
    }

    /**
     * Apakah ronde ini masih menunggu pengiriman file oleh Author.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
