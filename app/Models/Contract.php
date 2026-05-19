<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'user_id',
        'contract_number',
        'title',
        'description',
        'value',
        'start_date',
        'end_date',
        'status',
        'generated_at',
        'generated_by',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value'        => 'decimal:2',
        'start_date'   => 'date',
        'end_date'     => 'date',
        'generated_at' => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'status_label',
        'status_color',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal this contract belongs to.
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the user (pengelola jurnal) who owns this contract.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who generated this contract.
     */
    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, ?string $status)
    {
        if (! $status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get human-readable status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft'    => 'Draft',
            'aktif'    => 'Aktif',
            'selesai'  => 'Selesai',
            'batal'    => 'Dibatalkan',
            default    => 'Tidak Diketahui',
        };
    }

    /**
     * Get status color for badge rendering.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft'   => 'gray',
            'aktif'   => 'green',
            'selesai' => 'blue',
            'batal'   => 'red',
            default   => 'gray',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if this contract is in draft state (can still be edited).
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if this contract is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'aktif';
    }

    /**
     * Check if this contract is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'selesai';
    }

    /**
     * Generate a unique contract number.
     */
    public static function generateContractNumber(): string
    {
        $year    = now()->format('Y');
        $month   = now()->format('m');
        $count   = static::whereYear('created_at', $year)->count() + 1;
        $sequence = str_pad($count, 4, '0', STR_PAD_LEFT);

        return "KTR/{$year}/{$month}/{$sequence}";
    }

    /**
     * Available status transitions.
     *
     * @return array<string, string>
     */
    public static function getStatusOptions(): array
    {
        return [
            'draft'   => 'Draft',
            'aktif'   => 'Aktif',
            'selesai' => 'Selesai',
            'batal'   => 'Dibatalkan',
        ];
    }
}
