<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Models\RevisionRound; // Menggunakan RevisionRound sesuai spesifikasi Modul 5
use App\Http\Requests\Revision\EditorDecisionRequest;
use Illuminate\Http\JsonResponse;

class EditorRevisionController extends Controller
{
    /**
     * Memproses keputusan editor terhadap revisi dokumen.
     */
    public function decide(EditorDecisionRequest $request, $id): JsonResponse
    {
        // 1. Cari data berdasarkan model RevisionRound
        $revision = RevisionRound::findOrFail($id);

        $message = '';

        // 2. Logika pemetaan sesuai spesifikasi Enum status proyek Anda
        switch ($request->decision) {
            case 'Approved':
                $revision->status = 'Approved';
                $revision->editor_notes = $request->notes;
                $message = 'Revisi berhasil diterima (Approved).';
                break;

            case 'Rejected':
                $revision->status = 'Rejected';
                $revision->editor_notes = $request->notes;
                $message = 'Dokumen ditolak (Rejected).';
                break;

            case 'Awaiting_Revision':
                $revision->status = 'Awaiting_Revision';
                $revision->editor_notes = $request->notes;
                $message = 'Permintaan revisi dikembalikan ke penulis (Awaiting Revision).';
                break;
        }

        // 3. Simpan ke database
        $revision->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $revision,
        ], 200);
    }
}
