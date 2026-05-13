<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\FundingTerm;
use App\Models\User;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'contract_number',
        'contract_date',
        'proposal_id',
        'researcher_id',
        'party_1',
        'party_2',
        'total_approved_funding',
        'contract_status',
        'financial_document',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contract_date' => 'datetime',
        'total_approved_funding' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contracts';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the researcher/principal investigator
     */
    public function researcher()
    {
        return $this->belongsTo(User::class, 'researcher_id');
    }

    /**
     * Get the funding terms/disbursement schedule
     */
    public function fundingTerms()
    {
        return $this->hasMany(FundingTerm::class);
    }

    /**
     * Get the user who created this contract
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this contract
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
     * Scope to filter contracts by researcher
     */
    public function scopeForResearcher($query, $researcherId)
    {
        return $query->where('researcher_id', $researcherId);
    }

    /**
     * Scope to filter active contracts
     */
    public function scopeActive($query)
    {
        return $query->where('contract_status', 'aktif');
    }

    /**
     * Scope to get contracts with their funding terms
     */
    public function scopeWithFundingTerms($query)
    {
        return $query->with(['fundingTerms' => function ($q) {
            $q->orderBy('order');
        }]);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get the total disbursed funding
     */
    public function getTotalDisbursedAttribute()
    {
        return $this->fundingTerms()
            ->where('status', 'cair')
            ->sum('nominal');
    }

    /**
     * Get the remaining funding
     */
    public function getRemainingFundingAttribute()
    {
        return $this->total_approved_funding - $this->getTotalDisbursedAttribute();
    }

    /**
     * Get the disbursement percentage
     */
    public function getDisbursementPercentageAttribute()
    {
        if ($this->total_approved_funding <= 0) {
            return 0;
        }
        return ($this->getTotalDisbursedAttribute() / $this->total_approved_funding) * 100;
    }
}
