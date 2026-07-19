<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevisionRound extends Model
{
    use HasFactory;

    // 1. Memberitahu nama tabel dan primary key yang benar
    protected $table = 'revision_rounds';

    protected $primaryKey = 'id_round';

    // 2. Mengizinkan kolom-kolom ini diisi secara otomatis (Mass Assignment)
    protected $fillable = [
        'id_submission',
        'round_number',
        'editor_decision_note',
        'due_date',
        'status',
    ];

    // 3. Membuat relasi ke tabel Submissions
    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id');
    }
}
