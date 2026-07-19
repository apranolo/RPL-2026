<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * Model for the `proposals` table (Modul 1 – Manajemen Proposal Penelitian).
 *
 * @property int         $id
 * @property int         $id_pengusul
 * @property int|null    $id_skema_pendanaan
 * @property string      $judul_penelitian
 * @property string      $abstrak
 * @property string      $latar_belakang
 * @property string|null $file_dokumen_proposal
 * @property string      $status_proposal         draft|submitted|administrasi_valid|ditolak
 * @property string|null $tanggal_pengajuan
 * @property float|null  $total_pendanaan_disetujui
 * @property int|null    $deleted_by
 */
class Proposal extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'proposals';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_pengusul',
        'id_skema_pendanaan',
        'judul_penelitian',
        'abstrak',
        'latar_belakang',
        'file_dokumen_proposal',
        'status_proposal',
        'tanggal_pengajuan',
        'total_pendanaan_disetujui',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tanggal_pengajuan'         => 'date',
        'total_pendanaan_disetujui' => 'decimal:2',
        'created_at'                => 'datetime',
        'updated_at'                => 'datetime',
        'deleted_at'                => 'datetime',
    ];

    /* --------------------------------------------------------------------------
    | Status constants – mirrors PRD Modul 1 enum values
    -------------------------------------------------------------------------- */

    public const STATUS_DRAFT               = 'draft';
    public const STATUS_SUBMITTED           = 'submitted';
    public const STATUS_ADMINISTRASI_VALID  = 'administrasi_valid';
    public const STATUS_DITOLAK             = 'ditolak';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * The researcher (Dosen/Peneliti) who submitted this proposal.
     */
    public function pengusul()
    {
        return $this->belongsTo(User::class, 'id_pengusul');
    }

    /**
     * The funding scheme (Skema Pendanaan) for this proposal.
     */
    public function skemaPendanaan()
    {
        return $this->belongsTo(SkemaPendanaan::class, 'id_skema_pendanaan');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope: only draft proposals.
     */
    public function scopeDraft($query)
    {
        return $query->where('status_proposal', self::STATUS_DRAFT);
    }

    /**
     * Scope: only submitted proposals (waiting admin review).
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status_proposal', self::STATUS_SUBMITTED);
    }

    /**
     * Scope: only proposals that passed administrative review.
     */
    public function scopeAdministrasiValid($query)
    {
        return $query->where('status_proposal', self::STATUS_ADMINISTRASI_VALID);
    }

    /**
     * Scope: only rejected proposals.
     */
    public function scopeDitolak($query)
    {
        return $query->where('status_proposal', self::STATUS_DITOLAK);
    }

    /**
     * Scope: filter by researcher (pengusul).
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('id_pengusul', $userId);
    }

    /**
     * Scope: filter proposals belonging to a specific university.
     *
     * Joins with users table to scope by university_id.
     */
    public function scopeForUniversity($query, ?int $universityId)
    {
        if (is_null($universityId)) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('pengusul', function ($q) use ($universityId) {
            $q->where('university_id', $universityId);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Human-readable status label (Bahasa Indonesia).
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status_proposal) {
            self::STATUS_DRAFT              => 'Draft',
            self::STATUS_SUBMITTED          => 'Diajukan',
            self::STATUS_ADMINISTRASI_VALID => 'Administrasi Valid',
            self::STATUS_DITOLAK            => 'Ditolak',
            default                         => ucfirst($this->status_proposal),
        };
    }

    /**
     * Check if the proposal document file exists in storage.
     */
    public function hasDocument(): bool
    {
        return ! empty($this->file_dokumen_proposal)
            && Storage::disk('public')->exists($this->file_dokumen_proposal);
    }

    /**
     * Get the public download URL for the proposal document.
     */
    public function getDocumentUrlAttribute(): ?string
    {
        return $this->hasDocument()
            ? Storage::disk('public')->url($this->file_dokumen_proposal)
            : null;
    }

    /*
    |--------------------------------------------------------------------------
    | Boot
    |--------------------------------------------------------------------------
    */

    protected static function boot()
    {
        parent::boot();

        // Auto-set tanggal_pengajuan when status changes to 'submitted'
        static::saving(function (self $model) {
            if (
                $model->isDirty('status_proposal')
                && $model->status_proposal === self::STATUS_SUBMITTED
                && $model->tanggal_pengajuan === null
            ) {
                $model->tanggal_pengajuan = now()->toDateString();
            }
        });

        // Auto-fill deleted_by on soft-delete
        static::deleting(function (self $model) {
            if (auth()->check() && ! $model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
}
