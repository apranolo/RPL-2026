<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'contract_id',
        'user_id',
        'title',
        'content',
        'report_type',
        'report_date',
        'progress_percentage',
        'report_period',
        'attachment_path',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'report_date' => 'date',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
