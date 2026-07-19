<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Models\RevisionRound;
use App\Models\Submission;
use App\Models\SubmissionFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RevisionController extends Controller
{
    /**
     * Menampilkan form unggah revisi dan memproses pengiriman berkas
     * revisi naskah oleh Author untuk ronde revisi tertentu.
     *
     * Endpoint ini merupakan bagian dari Modul 2 Kelas B (Proposal Riset).
     * Berkas diunggah ke storage dan dicatat pada tabel submission_files
     * yang terhubung ke id_submission (bukan journal_assessment_id).
     *
     * @route GET  /revision/upload/{id_round}
     * @route POST /revision/upload/{id_round}
     */
    public function uploadRevision(Request $request, $id_round)
    {
        // Ambil ronde revisi beserta submission terkait menggunakan primary key id_round
        $revisionRound = RevisionRound::where('id_round', $id_round)
            ->with(['submission.author'])
            ->firstOrFail();

        $submission = $revisionRound->submission;
        $user       = $request->user();

        // Hanya Author pemilik submission yang boleh mengunggah revisi
        if ($submission->author_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengunggah revisi ini.');
        }

        // Ronde harus masih menunggu revisi (Awaiting_Revision)
        if ($revisionRound->status !== 'Awaiting_Revision') {
            return redirect()
                ->route('submissions.show', $submission->id)
                ->withErrors(['error' => 'Ronde revisi ini sudah tidak menerima unggahan baru.']);
        }

        // -----------------------------------------------------------------
        // Tangani POST: proses unggahan berkas revisi Author
        // -----------------------------------------------------------------
        if ($request->isMethod('POST')) {
            $validated = $request->validate([
                'file'  => 'required|file|mimes:pdf,docx|max:20480', // maks 20 MB sesuai spec §3.A.3
                'notes' => 'nullable|string|max:500',
            ], [
                'file.required' => 'Silakan pilih berkas revisi terlebih dahulu.',
                'file.mimes'    => 'Format berkas harus PDF atau DOCX.',
                'file.max'      => 'Ukuran berkas maksimal 20 MB.',
            ]);

            try {
                $file             = $validated['file'];
                $originalName     = $file->getClientOriginalName();
                $extension        = $file->getClientOriginalExtension();
                $storedName       = time() . '_' . uniqid() . '.' . $extension;
                $directory        = 'revisions/' . $submission->id . '/round_' . $revisionRound->round_number;

                // Simpan berkas ke disk public
                $path = $file->storeAs($directory, $storedName, 'public');

                // Catat file ke tabel submission_files (model resmi development)
                SubmissionFile::create([
                    'submission_id'    => $submission->id,
                    'revision_round_id'=> $revisionRound->id_round,
                    'file_name'        => $originalName,
                    'file_path'        => $path,
                    'file_type'        => 'ManuscriptMain',
                    'mime_type'        => $file->getMimeType(),
                    'file_size'        => $file->getSize(),
                ]);

                // Ubah status ronde menjadi Submitted setelah Author mengunggah
                $revisionRound->update(['status' => 'Submitted']);

                return redirect()
                    ->route('submissions.show', $submission->id)
                    ->with('success', 'Berkas revisi berhasil diajukan ke Editor.');

            } catch (\Exception $e) {
                Log::error('Gagal mengunggah berkas revisi naskah', [
                    'id_round'      => $id_round,
                    'submission_id' => $submission->id,
                    'user_id'       => $user->id,
                    'exception'     => $e->getMessage(),
                ]);

                return back()->withErrors(['error' => 'Gagal mengunggah berkas. Silakan coba lagi.']);
            }
        }

        // -----------------------------------------------------------------
        // Tampilkan form unggah (GET) — render ke AuthorRevision.tsx
        // yang sudah ada di development (Modul 5 Kelas G)
        // -----------------------------------------------------------------
        return Inertia::render('Revision/UploadRevision', [
            'submission'    => $submission,
            'currentRound'  => $revisionRound,
            'fileHistory'   => SubmissionFile::where('submission_id', $submission->id)->latest()->get(),
        ]);
    }

    /**
     * Menampilkan histori semua versi berkas dari seluruh ronde revisi
     * untuk sebuah submission (versioning dokumen naskah).
     *
     * @route GET /revision/history/{submission}
     */
    public function versionHistory(Request $request, Submission $submission)
    {
        $user = $request->user();

        // Pastikan hanya Author submission yang bisa melihat histori versi
        if ($submission->author_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk melihat histori versi ini.');
        }

        // Ambil semua ronde revisi beserta file yang dikirim,
        // diurutkan dari ronde pertama ke ronde terbaru
        $revisionRounds = RevisionRound::where('id_submission', $submission->id)
            ->with([
                'submissionFiles',
            ])
            ->orderBy('round_number', 'asc')
            ->get();

        return Inertia::render('Revision/VersionHistory', [
            'submission'     => $submission,
            'revisionRounds' => $revisionRounds,
        ]);
    }

    /**
     * Method yang sudah ada di development — dipertahankan agar tidak
     * merusak fitur notifyAuthor milik tim lain.
     *
     * @route POST /revision/notify/{id_submission}
     */
    public function notifyAuthor(\App\Http\Requests\NotifyAuthorRevisionRequest $request, $id_submission)
    {
        $data      = $request->validated();
        $nextRound = (int) RevisionRound::where('id_submission', $id_submission)->max('round_number') + 1;

        RevisionRound::create([
            'id_submission'        => $id_submission,
            'round_number'         => $nextRound,
            'status'               => $data['status'],
            'editor_decision_note' => $data['editor_decision_note'],
            'due_date'             => $data['due_date'],
        ]);

        return redirect()->back()
            ->with('success', 'Keputusan dan catatan revisi berhasil dikirim ke Author!');
    }
}
