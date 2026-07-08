<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Requests\StoreReviewRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReviewController extends Controller
{
    /**
     * Show the assessment form for a specific review.
     *
     * @param  \App\Models\Review  $review
     * @return \Inertia\Response
     */
    public function assessForm(Review $review): Response
    {
        // Pastikan hanya reviewer yang ditunjuk yang dapat mengisi
        if ($review->reviewer_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki hak akses untuk menilai proposal ini.');
        }

        $review->load([
            'proposal.user',
            'proposal.researchSchema'
        ]);

        return Inertia::render('Reviewer/FormReview', [
            'review' => $review,
        ]);
    }

    /**
     * Store proposal review scores (first-time submission).
     *
     * @param  \App\Http\Requests\StoreReviewRequest  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeAssessment(StoreReviewRequest $request, Review $review): RedirectResponse
    {
        // Pastikan reviewer yang mengakses adalah yang ditunjuk
        if ($review->reviewer_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki hak akses untuk menilai proposal ini.');
        }

        // Validasi timeline / tenggat waktu review
        $now = Carbon::now();
        $startDate = Carbon::parse($review->tanggal_mulai_review)->startOfDay();
        $endDate = Carbon::parse($review->tanggal_selesai_review)->endOfDay();

        if ($now->lt($startDate)) {
            return back()->withErrors([
                'timeline' => 'Masa penilaian untuk proposal ini belum dimulai (dimulai tanggal ' . $startDate->format('d-m-Y') . ').'
            ]);
        }

        if ($now->gt($endDate)) {
            return back()->withErrors([
                'timeline' => 'Masa penilaian untuk proposal ini sudah berakhir pada tanggal ' . $endDate->format('d-m-Y') . '.'
            ]);
        }

        $validated = $request->validated();

        // Hitung total skor dari seluruh komponen penilaian
        $skorTotal = collect($validated['komponen_penilaian'])->sum('skor');

        // Pastikan skor tidak melebihi 100
        $skorTotal = min($skorTotal, 100);

        // Update data penilaian
        $review->update([
            'komponen_penilaian' => $validated['komponen_penilaian'],
            'catatan_evaluasi' => $validated['catatan_evaluasi'],
            'skor_total' => $skorTotal,
            'keputusan_rekomendasi' => $validated['keputusan_rekomendasi'],
        ]);

        return redirect()
            ->route('reviewer.evaluations.index')
            ->with('success', 'Penilaian proposal berhasil disimpan.');
    }

    /**
     * Update proposal review scores.
     *
     * @param  \App\Http\Requests\StoreReviewRequest  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateAssessment(StoreReviewRequest $request, Review $review): RedirectResponse
    {
        // Gunakan logika yang sama dengan menyimpan pertama kali
        return $this->storeAssessment($request, $review);
    }
}
