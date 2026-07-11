<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Submission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'journal_id',
        'user_id',
        'title',
        'description',
        'keywords',
        'language',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'keywords' => 'array',
    ];

    protected $appends = ['id_user', 'id_journal', 'abstract'];

    public function getIdUserAttribute()
    {
        return $this->user_id;
    }

    public function getIdJournalAttribute()
    {
        return $this->journal_id;
    }

    public function getAuthorIdAttribute()
    {
        return $this->user_id;
    }

    public function setAuthorIdAttribute($value)
    {
        $this->user_id = $value;
    }

    public function getAbstractAttribute()
    {
        return $this->description;
    }

    public function setAbstractAttribute($value)
    {
        $this->description = $value;
    }

    /**
     * Relasi ke Jurnal
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Relasi ke User (Author)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke kontributor pendamping (Co-Authors)
     */
    public function contributors(): HasMany
    {
        return $this->hasMany(SubmissionContributor::class);
    }

    /**
     * Relasi ke file-file lampiran
     */
    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }
}
