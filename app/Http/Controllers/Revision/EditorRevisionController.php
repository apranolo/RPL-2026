<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorRevisionController extends Controller
{
    /**
     * Memproses keputusan editor terhadap revisi dokumen.
     */
    public function decide(Request $request, $id): JsonResponse
    {
        // 1. Validasi input keputusan dan catatan dari Editor
        $request->validate([
            'decision' => 'required|in:accept,return_to_review,request_more_revision',
            'notes' => 'required_if:decision,return_to_review,request_more_revision|string|nullable',
        ], [
            'decision.required' => 'Keputusan harus dipilih.',
            'decision.in' => 'Pilihan keputusan tidak valid.',
            'notes.required_if' => 'Catatan wajib diisi jika revisi ditolak atau diminta revisi lagi.',
        ]);

        // 2. Cari data revisi berdasarkan ID
        $revision = Article::findOrFail($id);

        // 3. Logika percabangan berdasarkan keputusan Editor
        switch ($request->decision) {
            case 'accept':
                $revision->status = 'accepted';
                $revision->editor_notes = $request->notes;
                $message = 'Revisi berhasil diterima (Accept).';
                break;

            case 'return_to_review':
                $revision->status = 'under_review';
                $revision->editor_notes = $request->notes;
                $message = 'Dokumen dikembalikan ke tahap Review.';
                break;

            case 'request_more_revision':
                $revision->status = 'need_revision';
                $revision->editor_notes = $request->notes;
                $message = 'Permintaan revisi lagi berhasil dikirim ke penulis.';
                break;
        }

        // 4. Simpan perubahan ke database
        $revision->save();

        // 5. Kembalikan respons JSON untuk dibaca oleh frontend React
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $revision,
        ], 200);
    }
    // Trigger re-check GitHub Actions
}
