<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RevisionRound;

class RevisionController extends Controller
{
    /**
     * Menerima input dari Editor dan mengirim notifikasi revisi ke Author
     */
    public function notifyAuthor(Request $request, $id_submission)
    {
        // 1. Validasi input dari form Editor
        $request->validate([
            'status' => 'required|in:AwaitingRevision,ReviewedByEditor',
            'revision_note' => 'required|string',
            'revision_due_date' => 'required|date',
        ]);

        // 2. Simpan data revisi ke database menggunakan Model yang Anda buat
        $revision = RevisionRound::updateOrCreate(
            [
                'id_submission' => $id_submission,
                'round_number' => 1 // Untuk sementara kita set default ke ronde 1
            ],
            [
                'status' => $request->status,
                'revision_note' => $request->revision_note,
                'revision_due_date' => $request->revision_due_date,
            ]
        );

        // 3. TODO: Sistem Notifikasi 
        // (Nantinya di sini kita akan menambahkan kode untuk mengirim email ke Author
        // menggunakan fitur Mail atau Notifications bawaan Laravel)

        // 4. Kembalikan Editor ke halaman sebelumnya dengan pesan sukses
        return redirect()->back()->with('success', 'Keputusan dan catatan revisi berhasil dikirim ke Author!');
    }
}