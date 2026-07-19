<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * Role name constants
     */
    public const SUPER_ADMIN = 'Super Admin';

    public const ADMIN_KAMPUS = 'Admin Kampus';

    public const USER = 'User';

    public const PENGELOLA_JURNAL = 'Pengelola Jurnal';

    public const REVIEWER = 'Reviewer';

    public const EDITOR = 'Editor';

    public const SECTION_EDITOR = 'SectionEditor';

    public const ADMIN_KEUANGAN = 'Admin Keuangan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot('assigned_at', 'assigned_by');
    }

    public function scopeByName($query, string $name)
    {
        return $query->where('name', $name);
    }

    public function isSuperAdmin(): bool
    {
        return $this->name === self::SUPER_ADMIN;
    }

    public function isAdminKampus(): bool
    {
        return $this->name === self::ADMIN_KAMPUS;
    }

    public function isUser(): bool
    {
        return $this->name === self::USER;
    }

    public function isPengelolaJurnal(): bool
    {
        return $this->name === self::PENGELOLA_JURNAL;
    }

    public function isReviewer(): bool
    {
        return $this->name === self::REVIEWER;
    }

    public function isAdminKeuangan(): bool
    {
        return $this->name === self::ADMIN_KEUANGAN;
    }
}
