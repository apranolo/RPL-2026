<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Submission (Local Mock — Modul 2 Kelas G)
 *
 * ⚠️ CATATAN: Model ini dibuat secara lokal untuk keperluan testing.
 * Jangan di-commit ke branch utama. Tunggu model resmi dari Modul 2.
 *
 * @property int $id
 * @property int $journal_id
 * @property int $user_id
 * @property string $title
 * @property string $abstract
 * @property string $keywords
 * @property string $status
 * @property string|null $rejection_reason
 * @property int|null $reviewed_by
 * @property string|null $reviewed_at
 */
class Submission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'journal_id',
        'user_id',
        'title',
        'abstract',
        'keywords',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function editorialAssignments()
    {
        return $this->hasMany(EditorialAssignment::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
