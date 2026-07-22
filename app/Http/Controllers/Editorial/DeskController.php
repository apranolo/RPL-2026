<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;


use Inertia\Inertia;



class DeskController extends Controller
{
    /**

     * Update round tracking submission (ronde ke-N).
     *
     * SECURITY NOTE: akses rute ini WAJIB melewati middleware 'auth' dan
     * dibatasi peran Editor (lihat routes/web.php ->
     * editorial.desk.update-round). Sebelumnya rute ini sempat terdaftar
     * di luar grup 'auth' sehingga bisa diakses guest — sudah diperbaiki
     * di sisi routing, bukan di controller ini.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Submission  $submission
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateRound(Request $request, Submission $submission)
    {
        // 1. Validasi input ronde
        $validated = $request->validate([
            'current_round' => 'required|integer|min:1',
            'notes'         => 'nullable|string|max:1000',
        ]);

        try {
            // 2. Update kolom round tracking pada model Submission
            $submission->update([
                'current_round' => $validated['current_round'],
            ]);

            // 3. Kembali ke halaman sebelumnya dengan pesan sukses
            return redirect()->back()->with(
                'success',
                'Ronde tracking submission berhasil diperbarui ke ronde ' . $validated['current_round']
            );
        } catch (\Exception $e) {
            // Jika terjadi error sistem
            return redirect()->back()->with('error', 'Gagal memperbarui ronde tracking submission.');
        }
    }


         /**
     * Display the editorial desk inbox with tabs for different statuses.
     */
            public function inbox(Request $request)
    {
        // Calculate counts for each tab
        $counts = [
            'unassigned' => Submission::where('status', 'unassigned')->count(),
            'active' => Submission::where('status', 'active')->count(),
            'awaiting_decision' => Submission::where('status', 'awaiting_decision')->count(),
            'archived' => Submission::where('status', 'archived')->count(),
        ];

        $activeTab = $request->query('tab', 'unassigned');

        if (! in_array($activeTab, array_keys($counts))) {
            $activeTab = 'unassigned';
        }

        $submissions = Submission::with(['author', 'journal'])
            ->where('status', $activeTab)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Editorial/Desk/Inbox', [
            'counts' => $counts,
            'activeTab' => $activeTab,
            'submissions' => $submissions,
        ]);
    }

    public function show($id)
    {
        $submission = Submission::with(['files', 'author', 'editorialDecisions'])->findOrFail($id);

        $user = auth()->user();

        if (! $user || (! $user->hasRole('Editor') && ! $user->hasRole('Super Admin'))) {
            abort(403, 'Anda tidak memiliki akses untuk melihat naskah ini.');
        }

        return Inertia::render('Editorial/Desk/Show', [
            'submission' => $submission,
        ]);
    }
}