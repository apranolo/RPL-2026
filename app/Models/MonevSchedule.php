<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonevSchedule extends Model
{
    protected $fillable = [
        'contract_id',
        'evaluator_id',
        'date',
        'time',
        'location',
        'status',
    ];

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}