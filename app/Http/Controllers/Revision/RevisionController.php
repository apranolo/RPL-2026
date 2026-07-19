<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Models\RevisionRound;
use App\Models\SubmissionFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RevisionController extends Controller
{
    /**
     * Menampilkan form upload file revisi dan memproses unggahan file
     * revisi oleh Author untuk ronde revisi tertentu.
     *
     * @route GET  /user/revisions/{revisionRound}/upload
     * @route POST /user/revisions/{revisionRound}/upload
     */
    public function uploadRevision(Request $request, RevisionRound $revisionRound)
    {
        // Muat relasi yang diperlukan untuk otorisasi dan tampilan
        $revisionRound->load([
            'journalAssessment.journal',
            'journalAssessment.user',
            'requester',
            'submissionFiles.uploader',
        ]);

        $assessment = $revisionRound->journalAssessment;
        $user       = $request->user();

        // Pastikan hanya Author (pemilik jurnal) yang dapat mengunggah revisi
        if ($assessment->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengunggah revisi ini.');
        }

        // Ronde revisi harus dalam status pending agar dapat diunggah
        if (! $revisionRound->isPending()) {
            return redirect()
                ->route('user.assessments.show', $assessment->id)
                ->withErrors(['error' => 'Ronde revisi ini sudah tidak menerima unggahan baru.']);
        }

        // -------------------------------------------------------------------------
        // Tangani POST: proses unggahan file revisi
        // -------------------------------------------------------------------------
        if ($request->isMethod('POST')) {
            $validated = $request->validate([
                'files'         => 'required|array|min:1|max:5',
                'files.*'       => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // maks 10 MB
                'notes'         => 'nullable|string|max:1000',
                'submit_revision' => 'nullable|boolean',
            ], [
                'files.required'   => 'Minimal satu file harus diunggah.',
                'files.max'        => 'Maksimal 5 file per pengiriman.',
                'files.*.mimes'    => 'Format file harus PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
                'files.*.max'      => 'Ukuran setiap file maksimal 10 MB.',
            ]);

            DB::beginTransaction();
            try {
                $directory = 'revisions/'.$revisionRound->id;

                foreach ($validated['files'] as $file) {
                    $originalFilename = $file->getClientOriginalName();
                    $extension        = $file->getClientOriginalExtension();
                    $storedFilename   = time().'_'.uniqid().'.'.$extension;

                    $path = $file->storeAs($directory, $storedFilename, 'public');

                    SubmissionFile::create([
                        'revision_round_id' => $revisionRound->id,
                        'uploaded_by'       => $user->id,
                        'original_filename' => $originalFilename,
                        'stored_filename'   => $storedFilename,
                        'file_path'         => $path,
                        'file_size'         => $file->getSize(),
                        'mime_type'         => $file->getMimeType(),
                        'notes'             => $validated['notes'] ?? null,
                    ]);
                }

                // Jika Author memilih untuk mengirimkan revisi sekarang, ubah status ronde
                if (! empty($validated['submit_revision'])) {
                    $revisionRound->update(['status' => 'submitted']);
                }

                DB::commit();

                $message = ! empty($validated['submit_revision'])
                    ? 'File revisi berhasil dikirim.'
                    : 'File revisi berhasil diunggah. Klik "Kirim Revisi" saat semua file siap.';

                return redirect()
                    ->route('user.assessments.show', $assessment->id)
                    ->with('success', $message);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Gagal mengunggah file revisi', [
                    'revision_round_id' => $revisionRound->id,
                    'user_id'           => $user->id,
                    'exception'         => $e->getMessage(),
                    'trace'             => $e->getTraceAsString(),
                ]);

                return back()->withErrors(['error' => 'Gagal mengunggah file. Silakan coba lagi.']);
            }
        }

        // -------------------------------------------------------------------------
        // Tampilkan form upload (GET)
        // -------------------------------------------------------------------------
        return Inertia::render('Revision/UploadRevision', [
            'revisionRound' => $revisionRound,
            'assessment'    => $assessment,
        ]);
    }

    /**
     * Menampilkan histori semua versi file dari seluruh ronde revisi
     * untuk sebuah assessment (versioning dokumen).
     *
     * @route GET /user/assessments/{assessment}/version-history
     */
    public function versionHistory(Request $request, JournalAssessment $assessment)
    {
        $user = $request->user();

        // Pastikan hanya Author yang terkait yang bisa melihat histori versi
        if ($assessment->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk melihat histori versi ini.');
        }

        // Muat relasi journal untuk tampilan
        $assessment->load('journal:id,title,issn');

        // Ambil semua ronde revisi beserta file-file yang dikirim,
        // diurutkan dari ronde paling awal ke paling akhir
        $revisionRounds = RevisionRound::query()
            ->where('journal_assessment_id', $assessment->id)
            ->with([
                'submissionFiles.uploader:id,name',
                'requester:id,name',
            ])
            ->orderBy('round_number', 'asc')
            ->get()
            ->map(function (RevisionRound $round) {
                // Tambahkan accessor computed
                $round->append(['status_label', 'status_color']);
                $round->submissionFiles->each(function (SubmissionFile $file) {
                    $file->append(['file_size_human', 'download_url']);
                });

                return $round;
            });

        return Inertia::render('Revision/VersionHistory', [
            'assessment'    => $assessment,
            'revisionRounds' => $revisionRounds,
        ]);
    }
}
