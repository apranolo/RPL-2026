<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ReviewDecision;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function showManuscript(Article $article, \App\Services\AnonymizeService $anonymizeService)
    {
        // Pemeriksaan otorisasi penugasan
        $isAssigned = \App\Models\ReviewerAssignment::where('id_submission', $article->id)
            ->where('id_reviewer', auth()->id())
            ->exists();

        if (! $isAssigned) {
            abort(403, 'Anda tidak memiliki otorisasi untuk melihat naskah ini.');
        }

        // Anonimisasi Double-Blind menggunakan AnonymizeService sesuai panduan
        $manuscript = $anonymizeService->anonymize($article);

        $reviewDecision = ReviewDecision::where('id_submission', $article->id)
            ->where('id_reviewer', auth()->id())
            ->first();

        return Inertia::render('Review/FormReview', [
            'manuscript' => $manuscript,
            'reviewDecision' => $reviewDecision,
        ]);
    }

    public function submitReview(\App\Http\Requests\SubmitReviewRequest $request, Article $article)
    {
        // Pemeriksaan otorisasi penugasan
        $isAssigned = \App\Models\ReviewerAssignment::where('id_submission', $article->id)
            ->where('id_reviewer', auth()->id())
            ->exists();

        if (! $isAssigned) {
            abort(403, 'Anda tidak memiliki otorisasi untuk mengirim review pada naskah ini.');
        }

        $aggregate = (
            $request->score_originality +
            $request->score_methodology +
            $request->score_writing +
            $request->score_relevance +
            $request->score_conclusion
        ) / 5;

        ReviewDecision::updateOrCreate(
            [
                'id_submission' => $article->id,
                'id_reviewer' => auth()->id(),
            ],
            [
                'recommendation' => $request->recommendation,
                'comments' => $request->comments,
                'comments_private' => $request->comments_private,
                'score_originality' => $request->score_originality,
                'score_methodology' => $request->score_methodology,
                'score_writing' => $request->score_writing,
                'score_relevance' => $request->score_relevance,
                'score_conclusion' => $request->score_conclusion,
                'score_aggregate' => $aggregate,
                'status' => 'Submitted',
                'date_decided' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Review berhasil dikirim.');
    }
}
