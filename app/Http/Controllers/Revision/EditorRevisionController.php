<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Http\Requests\Revision\EditorDecisionRequest;
use App\Models\RevisionRound;
use Illuminate\Http\RedirectResponse;

class EditorRevisionController extends Controller
{
    /**
     * Memproses keputusan editor terhadap revisi dokumen.
     */
    public function decide(EditorDecisionRequest $request, $id): RedirectResponse
    {
        // Otorisasi sudah ditangani middleware 'role:User' di routes/web.php
        // dan EditorDecisionRequest::authorize() — tidak perlu cek ulang di sini.

        // 1. Cari data berdasarkan model RevisionRound (primary key: id_round)
        $revision = RevisionRound::findOrFail($id);

        $message = '';

        // 2. Logika pemetaan sesuai Enum status di migration revision_rounds
        switch ($request->decision) {
            case 'Approved':
                $revision->status = 'Approved';
                $revision->editor_decision_note = $request->notes;
                $message = 'Revisi berhasil diterima (Approved).';
                break;

            case 'Rejected':
                $revision->status = 'Rejected';
                $revision->editor_decision_note = $request->notes;
                $message = 'Dokumen ditolak (Rejected).';
                break;

            case 'Awaiting_Revision':
                $revision->status = 'Awaiting_Revision';
                $revision->editor_decision_note = $request->notes;
                $message = 'Permintaan revisi dikembalikan ke penulis (Awaiting Revision).';
                break;
        }

        // 3. Simpan ke database
        $revision->save();

        // 4. Respons kompatibel Inertia (bukan JSON)
        return redirect()->back()->with('success', $message);
    }
}
