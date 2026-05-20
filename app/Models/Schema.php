<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schema extends Model
{
    use HasFactory;

    protected $table = 'research_schemas';

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the proposals for the schema.
     */
    public function proposals()
    {
        return $this->hasMany(Proposal::class, 'research_schema_id');
    }
}
