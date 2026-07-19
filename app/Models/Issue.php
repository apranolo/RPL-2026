<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Issue extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_journal',       // HEAD compatibility
        'journal_id',
        'volume',
        'number',
        'year',
        'title',
        'description',
        'published_at',     // HEAD compatibility
        'publication_date',
        'status',
        'cover_image_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'volume' => 'integer',
        'number' => 'integer',
        'year' => 'integer',
        'publication_date' => 'date',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'cover_image_url',
        'id_journal',       // HEAD compatibility
        'nomor',
        'tahun',
        'judul_tematik',
        'deskripsi',
        'published_at',
        'galleys_count',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that owns this issue.
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class, 'journal_id');
    }

    /**
     * Get the galleys published in this issue.
     */
    public function galleys()
    {
        return $this->hasMany(Galley::class, 'issue_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    /**
     * Get the cover image URL.
     */
    public function getCoverImageUrlAttribute(): ?string
    {
        if (! $this->cover_image_path) {
            return null;
        }

        return Storage::url($this->cover_image_path);
    }

    /**
     * Get id_journal (alias for journal_id).
     */
    public function getIdJournalAttribute(): ?int
    {
        return $this->journal_id;
    }

    /**
     * Set id_journal (alias for journal_id).
     */
    public function setIdJournalAttribute($value): void
    {
        $this->attributes['journal_id'] = $value;
    }

    /**
     * Get nomor (alias for number).
     */
    public function getNomorAttribute(): ?int
    {
        return $this->number;
    }

    /**
     * Set nomor (alias for number).
     */
    public function setNomorAttribute($value): void
    {
        $this->attributes['number'] = $value;
    }

    /**
     * Get tahun (alias for year).
     */
    public function getTahunAttribute(): ?int
    {
        return $this->year;
    }

    /**
     * Set tahun (alias for year).
     */
    public function setTahunAttribute($value): void
    {
        $this->attributes['year'] = $value;
    }

    /**
     * Get judul tematik (alias for title).
     */
    public function getJudulTematikAttribute(): ?string
    {
        return $this->title;
    }

    /**
     * Set judul tematik (alias for title).
     */
    public function setJudulTematikAttribute($value): void
    {
        $this->attributes['title'] = $value;
    }

    /**
     * Get deskripsi (alias for description).
     */
    public function getDeskripsiAttribute(): ?string
    {
        return $this->description;
    }

    /**
     * Set deskripsi (alias for description).
     */
    public function setDeskripsiAttribute($value): void
    {
        $this->attributes['description'] = $value;
    }

    /**
     * Get published_at (alias for publication_date).
     */
    public function getPublishedAtAttribute(): ?string
    {
        return $this->publication_date ? $this->publication_date->format('Y-m-d') : null;
    }

    /**
     * Set published_at (alias for publication_date).
     */
    public function setPublishedAtAttribute($value): void
    {
        $this->attributes['publication_date'] = $value;
    }

    /**
     * Get dynamic count of galleys in this issue.
     */
    public function getGalleysCountAttribute(): int
    {
        return array_key_exists('galleys_count', $this->attributes)
            ? (int) $this->attributes['galleys_count']
            : $this->galleys()->count();
    }
}
