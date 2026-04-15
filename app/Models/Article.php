<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'oai_identifier',
        'oai_datestamp',
        'oai_set',
        'title',
        'abstract',
        'authors',
        'keywords',
        'doi',
        'publication_date',
        'volume',
        'issue',
        'pages',
        'article_url',
        'pdf_url',
        'last_harvested_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'authors' => 'array',
        'keywords' => 'array',
        'publication_date' => 'date',
        'oai_datestamp' => 'datetime',
        'last_harvested_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that owns this article
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get recent articles (ordered by publication date)
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('publication_date', 'desc');
    }

    /**
     * Scope to filter by publication year
     */
    public function scopeByYear($query, int $year)
    {
        return $query->whereYear('publication_date', $year);
    }

    /**
     * Scope to filter by volume
     */
    public function scopeByVolume($query, string $volume)
    {
        return $query->where('volume', $volume);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Get formatted authors list
     */
    public function getAuthorsListAttribute(): string
    {
        if (! $this->authors || ! is_array($this->authors)) {
            return 'Unknown';
        }

        return implode(', ', $this->authors);
    }

    /**
     * Get DOI URL
     */
    public function getDoiUrlAttribute(): ?string
    {
        return $this->doi ? "https://doi.org/{$this->doi}" : null;
    }

    /**
     * Get Google Scholar search URL
     */
    public function getGoogleScholarUrlAttribute(): string
    {
        $title = urlencode($this->title);

        return "https://scholar.google.com/scholar?q=intitle:\"{$title}\"";
    }

    /**
     * Get formatted volume/issue string
     */
    public function getVolumeIssueAttribute(): ?string
    {
        if (! $this->volume && ! $this->issue) {
            return null;
        }

        $parts = [];
        if ($this->volume) {
            $parts[] = "Vol. {$this->volume}";
        }
        if ($this->issue) {
            $parts[] = "No. {$this->issue}";
        }

        return implode(', ', $parts);
    }
}
