<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Proposal Model
 *
 * Merepresentasikan proposal penelitian yang diajukan oleh Dosen (User).
 * Kolom mengikuti skema migrasi 2026_04_23_203212_create_proposals_table.php
 *
 * @property int         $id
 * @property string      $title
 * @property string      $description
 * @property int         $user_id
 * @property int         $research_schema_id
 * @property string      $status_proposal  Draft|Submitted|Administrasi_Valid|Ditolak
 * @property string|null $rejection_reason
 * @property string|null $file_dokumen_proposal
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Proposal extends Model
{
    use HasFactory;

    // ─── Status Constants ────────────────────────────────────────────────────

    public const STATUS_DRAFT             = 'Draft';
    public const STATUS_SUBMITTED         = 'Submitted';
    public const STATUS_ADMINISTRASI_VALID = 'Administrasi_Valid';
    public const STATUS_DITOLAK           = 'Ditolak';

    // ─── Fillable ────────────────────────────────────────────────────────────

    protected $fillable = [
        'title',
        'description',
        'user_id',
        'research_schema_id',
        'status_proposal',
        'rejection_reason',
        'file_dokumen_proposal',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    /**
     * Relasi ke User (Dosen pengusul).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke ResearchSchema (skema penelitian).
     */
    public function researchSchema()
    {
        return $this->belongsTo(ResearchSchema::class);
    }
}
