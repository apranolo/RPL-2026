<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResearchOutput extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'outputs';

    protected $fillable = [
        'title',
        'type', // Jurnal/Buku/HKI/Produk
        'year',
        'user_id', // Dosen pengusul
        'status', // Status verifikasi
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
