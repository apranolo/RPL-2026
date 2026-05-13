<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Funding extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'termin_name',
        'amount',
        'status',
        'disbursement_date',
        'evidence_path',
    ];

    protected $casts = [
        'disbursement_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the contract that owns the funding.
     */
    public function contract()
    {
        // Assuming a Contract model exists or will be created
        // return $this->belongsTo(Contract::class);
        return $this->belongsTo(Pembinaan::class, 'contract_id'); // Temporary fallback to Pembinaan if no Contract
    }
}
