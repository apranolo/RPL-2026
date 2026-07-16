<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $table = 'user_roles';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'id_user',
        'id_journal',
        'role_name',
        'status',
        'assigned_at',
        'assigned_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    protected $appends = ['id_user'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class, 'id_journal');
    }

    public function getIdUserAttribute()
    {
        return $this->user_id;
    }

    public function setIdUserAttribute($value)
    {
        $this->attributes['user_id'] = $value;
    }
}
