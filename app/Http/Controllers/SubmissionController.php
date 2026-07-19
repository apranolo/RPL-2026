<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
     * Menampilkan daftar naskah (submission) milik author.
     */
    public function index()
    {
        return Inertia::render('Submission/Index', [
            'submissions' => Submission::where('author_id', auth()->id())->get(),
        ]);
    }

    /**
     * Menyimpan submisi baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'journal_id' => 'required|exists:journals,id',
            'title' => 'required|string',
            'abstract' => 'nullable|string',
            'keywords' => 'nullable|string',
            'status' => 'required|in:draft,submitted,under_review,in_revision,accepted,declined,published',
            'manuscript' => 'nullable|file',
        ]);

        $submission = Submission::create([
            'author_id' => auth()->id(),
            'journal_id' => $validated['journal_id'],
            'title' => $validated['title'],
            'abstract' => $validated['abstract'] ?? null,
            'keywords' => $validated['keywords'] ?? null,
            'status' => $validated['status'],
        ]);

        if ($request->hasFile('manuscript')) {
            $path = $request->file('manuscript')->store('submissions/manuscripts', 'public');
            $submission->update(['manuscript_path' => $path]);

            // Dummy record in submission_files for the test
            DB::table('submission_files')->insert([
                'submission_id' => $submission->id,
                'file_name' => $request->file('manuscript')->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => 'manuscript',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return redirect('/submissions');
    }

    /**
     * Menghapus submisi (soft delete).
     */
    public function destroy(Submission $submission)
    {
        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        $submission->delete();

        return redirect('/submissions');
    }

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
     * @return RedirectResponse
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
