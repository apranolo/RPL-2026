<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Contract;
use App\Models\User;

class FundingTerm extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'contract_id',
        'order',
        'term_name',
        'percentage',
        'nominal',
        'status',
        'disbursement_date',
        'receipt_number',
        'receipt_file',
        'notes',
        'updated_by',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'percentage' => 'decimal:2',
        'nominal' => 'decimal:2',
        'disbursement_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'funding_terms';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the contract this term belongs to
     */
    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Get the user who last updated this term
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get disbursed terms
     */
    public function scopeDisbursed($query)
    {
        return $query->where('status', 'cair');
    }

    /**
     * Scope to get pending terms
     */
    public function scopePending($query)
    {
        return $query->where('status', 'menunggu');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        $statuses = [
            'cair' => 'Dana Cair',
            'menunggu' => 'Menunggu Pencairan',
            'ditangguhkan' => 'Ditangguhkan',
            'batal' => 'Batal',
        ];

        return $statuses[$this->status] ?? ucfirst($this->status);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'cair' => 'success',
            'menunggu' => 'warning',
            'ditangguhkan' => 'secondary',
            'batal' => 'destructive',
        ];

        return $colors[$this->status] ?? 'default';
    }
}
