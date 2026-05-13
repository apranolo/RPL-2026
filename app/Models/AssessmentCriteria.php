<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentCriteria extends Model
{
    protected $table = 'assessment_criterias';

    protected $fillable = [
        'name',
        'description',
        'weight'
    ];

    public function review()
    {
        return $this->hasMany(Review::class, 'assessment_criteria_id');
    }
}