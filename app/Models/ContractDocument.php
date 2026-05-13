<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'document_name',
        'file_path',
        'file_type',
        'file_size',
        'contract_number',
        'contract_date',
        'signed_date',
        'status',
        'description',
        'uploaded_by',
    ];

    protected $casts = [
        'contract_date' => 'datetime',
        'signed_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that uploaded this contract document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
