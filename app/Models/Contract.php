<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'pembinaan_id',
        'proposal_id',
        'contract_number',
        'title',
        'description',
        'status',
        'contract_value',
        'party_1',
        'party_2',
        'start_date',
        'end_date',
        'signed_at',
        'document_path',
        'notes',
        'created_by',
        'updated_by',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function monevSchedules()
    {
        return $this->hasMany(MonevSchedule::class);
    }

    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }
}
