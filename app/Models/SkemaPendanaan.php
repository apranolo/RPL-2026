<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model for the `skema_pendanaan` lookup table.
 *
 * @property int         $id
 * @property string      $nama
 * @property string|null $deskripsi
 * @property bool        $is_active
 */
class SkemaPendanaan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'skema_pendanaan';

    protected $fillable = ['nama', 'deskripsi', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    /**
     * Proposals that belong to this funding scheme.
     */
    public function proposals()
    {
        return $this->hasMany(Proposal::class, 'id_skema_pendanaan');
    }
}
