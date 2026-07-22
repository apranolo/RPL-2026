<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\DiscussionMessage;
use App\Models\Submission;
use App\Models\SubmissionDiscussion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Mengelola diskusi editorial internal (Editor <-> Author) per submission.
 *
 * FIX (MUST FIX - Mismatch Model & Blocker Integrasi): controller ini
 * sebelumnya merujuk model `Discussion` (tabel `discussions`) dan sebuah
 * model `Submission` tiruan minimalis. Sesuai pembagian tugas proyek,
 * entitas diskusi yang benar adalah `SubmissionDiscussion`
 * (tabel `submission_discussions`) dan `DiscussionMessage`
 * (tabel `discussion_messages`), keduanya ditugaskan ke Alfin Ahmad
 * Juniar (Modul 5). Model tersebut belum di-merge, sehingga controller
 * ini sementara memakai versi mock lokal (Pilihan B) di
 * app/Models/SubmissionDiscussion.php dan app/Models/DiscussionMessage.php.
 * Model `Submission` di sini SUDAH memakai model resmi proyek — tidak ada
 * lagi model tiruan Submission.
 *
 * TODO: begitu model resmi Modul 5 di-merge ke branch development, hapus
 * mock lokal dan pastikan skema kolom di controller ini selaras.
 */
class EditorialDiscussionController extends Controller
{
    /**
     * Menampilkan seluruh thread diskusi milik satu submission, lengkap
     * dengan pesan-pesan di dalamnya (thread-style, terurut lama -> baru).
     */
    public function index($submissionId)
    {
        $submission = Submission::findOrFail($submissionId);

        $discussions = SubmissionDiscussion::where('submission_id', $submission->id)
            ->with([
                'creator:id,name',
                'messages' => fn ($query) => $query->orderBy('created_at', 'asc'),
                'messages.user:id,name',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Editorial/Desk/Discussion', [
            'submissionId' => (int) $submission->id,
            'discussions' => $discussions,
        ]);
    }

    /**
     * Menyimpan pesan diskusi baru.
     *
     * - Jika `discussion_id` dikirim: pesan ditambahkan sebagai balasan
     *   pada thread yang sudah ada (harus milik submission yang sama).
     * - Jika `discussion_id` tidak dikirim: sebuah thread baru dibuat
     *   terlebih dahulu (wajib mengisi `subject`), lalu pesan pertamanya
     *   disimpan pada thread tersebut.
     */
    public function store(Request $request, $submissionId)
    {
        $submission = Submission::findOrFail($submissionId);

        $validated = $request->validate([
            'discussion_id' => 'nullable|integer|exists:submission_discussions,id',
            'subject' => 'nullable|required_without:discussion_id|string|max:255',
            'message' => 'required|string',
        ]);

        if (!empty($validated['discussion_id'])) {
            // Pastikan thread yang dibalas benar-benar milik submission ini
            $discussion = SubmissionDiscussion::where('submission_id', $submission->id)
                ->findOrFail($validated['discussion_id']);
        } else {
            $discussion = SubmissionDiscussion::create([
                'submission_id' => $submission->id,
                'subject' => $validated['subject'],
                'created_by' => Auth::id(),
            ]);
        }

        DiscussionMessage::create([
            'submission_discussion_id' => $discussion->id,
            'user_id' => Auth::id(), // ID Editor atau Author yang sedang login
            'message' => $validated['message'],
        ]);

        return redirect()->back()->with('success', 'Pesan diskusi berhasil dikirim.');
    }
}