<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;

class ReviewController extends Controller
{
    /**
     * Simpan nilai review baru
     */
    public function storeAssessment(StoreReviewRequest $request)
    {
        $validated = $request->validated();
        
        // Simpan assessment (Review)
        $review = new Review();
        $review->proposal_id = $validated['proposal_id'];
        $review->reviewer_id = auth()->id(); // Asumsi menggunakan reviewer yang sedang login
        $review->score = $validated['score'];
        $review->comments = $validated['comments'] ?? null;
        $review->recommendation = $validated['recommendation'];
        $review->save();

        return redirect()->back()->with('success', 'Penilaian proposal berhasil disimpan.');
    }

    /**
     * Update nilai review yang sudah ada
     */
    public function updateAssessment(StoreReviewRequest $request, $id)
    {
        $validated = $request->validated();
        
        // Update assessment (Review)
        $review = Review::findOrFail($id);
        
        // Memastikan hanya reviewer yang bersangkutan yang bisa update
        if ($review->reviewer_id !== auth()->id()) {
            abort(403, 'Anda tidak diizinkan mengubah penilaian ini.');
        }

        $review->score = $validated['score'];
        $review->comments = $validated['comments'] ?? null;
        $review->recommendation = $validated['recommendation'];
        $review->save();

        return redirect()->back()->with('success', 'Penilaian proposal berhasil diperbarui.');
    }
}
