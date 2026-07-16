<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CopyeditingTask extends Model
{
    use HasFactory;

    // 1. Menyesuaikan nama tabel dan primary key
    protected $table = 'copyediting_tasks';
    protected $primaryKey = 'id_task';

    // 2. Mendaftarkan kolom yang aman untuk diisi otomatis (Mass Assignment)
    protected $fillable = [
        'id_submission',
        'id_copyeditor',
        'status',
        'editor_note',
        'copyeditor_note',
        'assigned_at',
        'completed_at',
    ];

    // 3. Relasi ke tabel Submissions (Naskah)
    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id');
    }

    // 4. Relasi ke tabel Users (sebagai Copyeditor)
    public function copyeditor()
    {
        return $this->belongsTo(User::class, 'id_copyeditor', 'id');
    }
}