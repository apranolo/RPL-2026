<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewDecision;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function showManuscript(Article $article)
    {
        // Anonimisasi Double-Blind: sembunyikan identitas penulis
        $manuscript = [
            'id' => $article->id,
            'title' => $article->title,
            'abstract' => $article->abstract,
            'keywords' => $article->keywords,
            'file_path' => $article->file_path,
        ];

        $reviewDecision = ReviewDecision::where('id_submission', $article->id)
            ->where('id_reviewer', auth()->id())
            ->first();

        return Inertia::render('Review/FormReview', [
            'manuscript' => $manuscript,
            'reviewDecision' => $reviewDecision,
        ]);
    }

    public function submitReview(Request $request, Article $article)
    {
        $request->validate([
            'recommendation' => 'required|in:Accept,Revise,Reject',
            'comments' => 'required|string',
            'comments_private' => 'nullable|string',
            'score_originality' => 'required|integer|min:1|max:5',
            'score_methodology' => 'required|integer|min:1|max:5',
            'score_writing' => 'required|integer|min:1|max:5',
            'score_relevance' => 'required|integer|min:1|max:5',
            'score_conclusion' => 'required|integer|min:1|max:5',
        ]);

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