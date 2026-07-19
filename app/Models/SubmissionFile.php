<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SubmissionFile extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'revision_round_id',
        'uploaded_by',
        'original_filename',
        'stored_filename',
        'file_path',
        'file_size',
        'mime_type',
        'notes',
    ];

    /**
     * Casting tipe atribut.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size'  => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relasi
    |--------------------------------------------------------------------------
    */

    /**
     * Ronde revisi yang memiliki file ini.
     */
    public function revisionRound()
    {
        return $this->belongsTo(RevisionRound::class);
    }

    /**
     * Pengguna (Author) yang mengunggah file ini.
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessor & Helper
    |--------------------------------------------------------------------------
    */

    /**
     * Ukuran file dalam format yang mudah dibaca.
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size ?? 0;

        if ($bytes < 1024) {
            return $bytes.' B';
        } elseif ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 1).' MB';
    }

    /**
     * URL unduhan file dari disk public.
     */
    public function getDownloadUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Apakah file bertipe PDF.
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }
}
