<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Citation extends Model
{
    protected $fillable = [
        'user_id',
        'h_index',
        'total_citations',
        'yearly_data',
        'last_synced_at',
    ];

    /**
     * Virtual attributes appended to array/JSON output.
     * `id_user` maps `user_id` to match the frontend TypeScript interface.
     *
     * @var array<int, string>
     */
    protected $appends = ['id_user'];

    protected function casts(): array
    {
        return [
            'h_index' => 'integer',
            'total_citations' => 'integer',
            'yearly_data' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    /**
     * The user this citation record belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getIdUserAttribute(): ?int
    {
        return $this->user_id;
    }
}
