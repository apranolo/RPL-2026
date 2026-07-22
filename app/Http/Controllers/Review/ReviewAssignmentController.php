<?php

<<<<<<< HEAD
namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use App\Models\Submission;
=======
/**
 * Controller untuk perpanjangan due date reviewer assignment pada Proposal.
 *
 * Authorization: Hanya SuperAdmin, AdminKampus, dan PengelolaJurnal
 * yang dapat memperpanjang due date via ProposalPolicy::extendDueDate.
 */

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use App\Models\ReviewerAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Mengelola proses pengundangan dan pembatalan Reviewer untuk sebuah naskah.
 *
 * Otorisasi berbasis peran (role) ditangani sepenuhnya oleh middleware
 * di routes/web.php — bukan oleh Policy (ReviewAssignmentPolicy tidak digunakan).
 * Pastikan semua route di sini terdaftar di dalam grup:
 *   middleware(['auth', 'role:Editor'])
 */
class ReviewAssignmentController extends Controller
{
    /**
     * Memproses pengiriman undangan ke Reviewer
     *
     * Otorisasi (hanya Editor) ditangani oleh middleware `role:Editor`
     * di routes/web.php, sehingga pengecekan manual hasRole() di sini
     * tidak diperlukan lagi.
     *
     * @param  Request  $request  Harus mengandung submission_id, reviewer_id,
     *                            dan opsional round (default: 1).
     * @return RedirectResponse   Redirect balik dengan flash message sukses/gagal.
     */
    public function invite(Request $request): RedirectResponse
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'reviewer_id'   => 'required|exists:users,id',
            // Round bisa dikirim dari frontend; fallback ke 1 jika tidak ada.
            'round'         => 'sometimes|integer|min:1',
        ]);

        $round = $validated['round'] ?? 1;

        // 3. Pencegahan Duplikasi — gunakan firstOrCreate untuk menghindari
        //    race condition yang bisa terjadi antara ->exists() dan ->create().
        //    $created = true  : baru dibuat (undangan berhasil)
        //    $created = false : sudah ada (duplikat, batalkan)
        [$assignment, $created] = ReviewAssignment::firstOrCreate(
            [
                'submission_id' => $validated['submission_id'],
                'reviewer_id'   => $validated['reviewer_id'],
                'round'         => $round,
            ],
            [
                // Status enum per migration 2026_05_14_010000:
                // Pending, Accepted, Declined, Completed, Cancelled.
                'status'   => 'Pending',
                'due_date' => now()->addDays(7), // SLA 7 hari
            ]
        );

        if (! $created) {
            return back()->withErrors([
                'message' => 'Reviewer tersebut sudah diundang untuk naskah ini pada ronde yang sama.',
            ]);
        }

        // Catatan: Email notifikasi akan di-handle oleh Event/Observer dari Modul 7.

        return back()->with('success', 'Undangan berhasil dikirimkan ke Reviewer.');
    }

    /**
     * Membatalkan undangan review assignment.
     *
     * Otorisasi: Route ini dilindungi oleh middleware `role:Editor` di
     * routes/web.php. ReviewAssignmentPolicy sengaja TIDAK digunakan karena
     * belum ada policy tersebut di upstream; pengecekan via middleware sudah
     * dianggap cukup. Jika policy ditambahkan di masa mendatang, tambahkan:
     *   $this->authorize('cancel', $assignment);
     *
     * Hanya assignment berstatus 'Pending' yang dapat dibatalkan.
     * Assignment yang sudah direspons reviewer (Accepted/Declined)
     * atau sudah selesai (Completed) tidak bisa diubah di sini.
     *
     * Catatan kolom: Tabel review_assignments tidak memiliki kolom
     * `cancel_reason` tersendiri. Alasan pembatalan disimpan di kolom
     * `decline_reason` yang sudah tersedia (lihat migration
     * 2026_05_14_010000). Kolom ini aman digunakan bersama karena
     * status 'Cancelled' dan 'Declined' bersifat mutually exclusive.
     *
     * @param  Request           $request     Opsional: field `reason` (string, max 500).
     * @param  ReviewAssignment  $assignment  Assignment yang akan dibatalkan
     *                                        (route-model binding).
     * @return RedirectResponse               Redirect balik dengan flash message.
     */
    public function cancel(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        // Validasi input: reason bersifat opsional, namun jika diisi
        // minimal 3 karakter agar tidak hanya spasi/karakter tunggal,
        // dan maksimal 500 karakter.
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'min:3', 'max:500'],
        ]);

        // Undangan hanya bisa dibatalkan selama masih berstatus 'Pending'.
        // Status enum per migration 2026_05_14_010000:
        // Pending, Accepted, Declined, Completed, Cancelled.
        if ($assignment->status !== 'Pending') {
            return back()->with('error', 'Assignment cannot be cancelled at this stage.');
        }

        $assignment->update([
            'status'         => 'Cancelled',
            // Alasan disimpan di decline_reason (lihat PHPDoc di atas).
            'decline_reason' => $validated['reason'] ?? null,
        ]);

        // TODO: Kirim notifikasi ke Reviewer (Modul 7).

        return back()->with('success', 'Review assignment has been cancelled.');
    }

    /**
     * Extend due date for a reviewer assignment.
     *
     * Memvalidasi input dan memperbarui kolom due_date pada
     * reviewer_assignments untuk assignment yang diberikan.
     */
    public function extendDue(Request $request, ReviewerAssignment $reviewerAssignment): RedirectResponse
    {
        $this->authorize('extendDueDate', $reviewerAssignment->proposal);

        $validated = $request->validate([
            'due_date' => ['required', 'date', 'after:today'],
        ]);

        $reviewerAssignment->update([
            'due_date' => $validated['due_date'],
        ]);

        return back()->with('success', 'Due date berhasil diperpanjang.');
    }
}
