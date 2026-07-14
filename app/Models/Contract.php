<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number',
        'title',
        'description',
        'status',
        'contract_value',
        'proposal_id',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
