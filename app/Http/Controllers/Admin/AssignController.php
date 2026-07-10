<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review; // Mengimpor Model Review sesuai instruksi
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class AssignController extends Controller
{
    /**
     * Method untuk assign reviewer ke proposal.
     * * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function assign(Request $request): RedirectResponse
    {
        // 1. Validasi input dari request
        $validated = $request->validate([
            'proposal_id' => 'required|integer|exists:proposals,id',
            'reviewer_id' => 'required|integer|exists:users,id', // Asumsi reviewer adalah user
        ]);

        // 2. Menyimpan data penugasan ke database menggunakan Model Review
        Review::create([
            'proposal_id' => $validated['proposal_id'],
            'reviewer_id' => $validated['reviewer_id'],
            // Anda bisa menambahkan kolom lain sesuai kebutuhan, misalnya:
            // 'status' => 'assigned' 
        ]);

        // 3. Mengembalikan response (redirect kembali ke halaman sebelumnya dengan pesan sukses)
        return back()->with('success', 'Reviewer berhasil ditugaskan ke proposal.');
    }
    /**
    * Menghapus penunjukan reviewer dari proposal.
    *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
    */
    public function unassign(int $id): RedirectResponse
    {
    $review = Review::findOrFail($id);

    $review->delete();

    return back()->with(
        'success',
        'Penunjukan reviewer berhasil dihapus.'
    );
    }

}
