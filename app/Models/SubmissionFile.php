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
        'submission_id',
        'revision_round_id',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
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

    /**
     * Relasi ke RevisionRound (opsional — file bisa diunggah di luar ronde).
     *
     * @return BelongsTo
     */
    public function revisionRound(): BelongsTo
    {
        return $this->belongsTo(RevisionRound::class, 'revision_round_id', 'id_round');
    }
}
