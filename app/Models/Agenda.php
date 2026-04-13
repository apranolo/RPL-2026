<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Agenda extends Model
{
    /** @use HasFactory<\Database\Factories\AgendaFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'university_id',
        'user_id',
        'title',
        'slug',
        'type',
        'description',
        'thumbnail',
        'date_start',
        'date_end',
        'time_start',
        'time_end',
        'location_type',
        'location_venue',
        'location_link',
        'registration_link',
        'price',
        'quota',
        'contact_person_name',
        'contact_person_phone',
        'contact_person_email',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'date_start' => 'date',
        'date_end' => 'date',
        'time_start' => 'datetime:H:i',
        'time_end' => 'datetime:H:i',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($agenda) {
            if (! $agenda->slug) {
                $agenda->slug = static::generateUniqueSlug($agenda->title);
            }
        });
    }

    public static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (static::where('slug', $slug)->withTrashed()->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function registrations()
    {
        return $this->belongsToMany(User::class, 'agenda_registrations')->withTimestamps();
    }

    public function scopeForUniversity(Builder $query, int $universityId): Builder
    {
        return $query->where('university_id', $universityId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? asset('storage/'.$this->thumbnail) : null;
    }
}
