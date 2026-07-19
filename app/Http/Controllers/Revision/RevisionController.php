<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotifyAuthorRevisionRequest;
use App\Models\RevisionRound;

class RevisionController extends Controller
{
    public function notifyAuthor(NotifyAuthorRevisionRequest $request, $id_submission)
    {
        // Data sudah tervalidasi & terotorisasi oleh NotifyAuthorRevisionRequest.
        $data = $request->validated();
        $nextRound = (int) RevisionRound::where('id_submission', $id_submission)->max('round_number') + 1;

        $revision = RevisionRound::create([
            'id_submission' => $id_submission,
            'round_number' => $nextRound,
            'status' => $data['status'],
            'editor_decision_note' => $data['editor_decision_note'],
            'due_date' => $data['due_date'],
        ]);

        return redirect()->back()
            ->with('success', 'Keputusan dan catatan revisi berhasil dikirim ke Author!');
    }
}
