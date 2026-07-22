<?php

namespace App\Http\Controllers\Copyediting;

use App\Http\Controllers\Controller;
use App\Models\CopyeditingTask;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CopyeditingController extends Controller
{
    /**
     * Menampilkan halaman penugasan Copyeditor (data dikirim via Inertia props).
     */
    public function index(Request $request): Response
    {
        // Otorisasi: sudah dijamin middleware 'role:User' di routes/web.php,
        // ini sebagai lapisan pertahanan tambahan (defense-in-depth)
        if (! $request->user()->hasAnyRole([Role::USER, Role::SUPER_ADMIN])) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        // Sesuai PRD Modul 5: submission masuk fase Copyediting hanya setelah
        // di-Accept oleh putusan editorial pasca-revisi (EditorRevisionController@decide
        // mengubah status RevisionRound terkait menjadi 'Approved').
        $submissions = Submission::with('author')
            ->whereHas('revisionRounds', function ($q) {
                $q->where('status', 'Approved');
            })
            ->latest()
            ->get();

        // Copyeditor menggunakan role yang sama (User) sesuai konfirmasi tim
        $copyeditors = User::whereHas('role', function ($q) {
            $q->where('name', Role::USER);
        })->get(['id', 'name', 'email']);

        return Inertia::render('Copyediting/Assign', [
            'submissions' => $submissions,
            'copyeditors' => $copyeditors,
        ]);
    }

    /**
     * Menugaskan seorang Copyeditor ke sebuah Submission.
     */
    public function assign(Request $request): RedirectResponse
    {
        // Otorisasi: sudah dijamin middleware 'role:User' di routes/web.php,
        // ini sebagai lapisan pertahanan tambahan (defense-in-depth)
        if (! $request->user()->hasAnyRole([Role::USER, Role::SUPER_ADMIN])) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini.');
        }

        $validated = $request->validate([
            'id_submission' => 'required|integer|exists:submissions,id',
            'id_copyeditor' => 'required|integer|exists:users,id',
        ]);

        CopyeditingTask::updateOrCreate(
            ['id_submission' => $validated['id_submission']],
            [
                'id_copyeditor' => $validated['id_copyeditor'],
                'status' => 'Assigned',
                'assigned_at' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Copyeditor berhasil ditugaskan ke submission.');
    }

    /**
     * Upload file hasil copyedit oleh Copyeditor.
     */
    public function uploadCopyedited(Request $request, $id)
    {
        $request->validate([
            'copyedited_file' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('copyedited_file')) {
            $path = $request->file('copyedited_file')->store('copyedited', 'public');

            CopyeditingTask::where('id_submission', $id)->update([
                'file_copyedited' => $path,
                'copyeditor_notes' => $request->notes,
                'status' => 'Completed',
            ]);

            return back()->with('success', 'File hasil copyediting berhasil diunggah.');
        }

        return back()->with('error', 'Gagal mengunggah file copyedit.');
    }

    /**
     * Persetujuan Author atas hasil copyediting.
     */
    public function authorApprove(Request $request, $id)
    {
        CopyeditingTask::where('id_submission', $id)->update([
            'author_approved' => true,
            'approved_at' => now(),
            'status' => 'ApprovedByAuthor',
        ]);

        return back()->with('success', 'Hasil copyediting telah disetujui oleh Author.');
    }
}
