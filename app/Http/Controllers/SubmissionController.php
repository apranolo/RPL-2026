<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Menangani alur naskah (submission) milik author: melihat detail
 * beserta riwayat status, dan membatalkan naskah yang masih berstatus draft.
 *
 * BLOCKER (belum diselesaikan pihak lain, di luar kendali PR ini):
 * Model Submission saat ini belum memiliki relasi reviewer() dan
 * statusHistories(). Method show() di bawah akan melempar
 * RelationNotFoundException sampai relasi tersebut ditambahkan ke
 * app/Models/Submission.php oleh pengembang yang bertanggung jawab
 * atas modul terkait. Jangan hapus pemanggilan relasi ini — ini adalah
 * kontrak data yang sudah disepakati di PR #107/#108 untuk halaman
 * detail & timeline; yang kurang hanya implementasinya di model.
 */
class SubmissionController extends Controller
{
    /**
     * Menampilkan halaman detail naskah beserta linimasa status.
     */
    public function show(Submission $submission): Response
    {
        $submission->load([
            'author',
            'statusHistories',
            'reviewer',
        ]);

        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Submission/Show', [
            'submission' => $submission,
            'tracking' => $submission->statusHistories,
        ]);
    }

    /**
     * Membatalkan (menghapus) naskah yang masih berstatus draft.
     * Hanya author pemilik naskah yang boleh membatalkan.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(Submission $submission)
    {
        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        if ($submission->status !== 'draft') {
            return back()->with(
                'error',
                'Only draft submissions can be cancelled.'
            );
        }

        $submission->delete();

        // TODO: ganti ke route('submissions.index') begitu halaman
        // daftar submission dibuat. Untuk saat ini rute itu belum ada
        // di web.php, jadi redirect ke dashboard agar tidak 404.
        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Submission cancelled successfully.'
            );
    }
}
