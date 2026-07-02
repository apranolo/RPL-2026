<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\EvaluationIndicator;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\ReviewAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewSummaryController extends Controller
{
    public function index(Request $request)
    {
        $submissionId = $request->integer('submission_id');

        $submission = Proposal::query()
            ->with([
                'user',
                'researchSchema',
            ])
            ->findOrFail($submissionId);


        $assignments = ReviewAssignment::query()
            ->where('submission_id', $submissionId)
            ->with(['reviewer'])
            ->get();

        $reviewerIds = $assignments->pluck('reviewer_id')->filter()->values();

        $criteriaScores = EvaluationIndicator::query()->orderBy('id')->get(['id', 'name']);

        $reviews = Review::query()
            ->whereIn('review_assignment_id', $assignments->pluck('id'))
            ->with(['criteria'])
            ->get();

        $reviewerSummaries = $assignments->map(function (ReviewAssignment $assignment) use ($reviews) {
            $assignmentReviews = $reviews->where('review_assignment_id', $assignment->id);

            $scoresByCriteriaId = $assignmentReviews
                ->groupBy('criteria_id')
                ->map(fn ($group) => $group->first()->score);

            $recommendationsByCriteriaId = $assignmentReviews
                ->groupBy('criteria_id')
                ->map(fn ($group) => $group->first()->recommendation);

            return [
                'reviewer' => [
                    'id' => $assignment->reviewer?->id,
                    'name' => $assignment->reviewer?->name,
                    'email' => $assignment->reviewer?->email,
                ],
                'scoresByCriteriaId' => $scoresByCriteriaId,
                'recommendationsByCriteriaId' => $recommendationsByCriteriaId,
            ];
        })->values();

        return Inertia::render('Review/Summary', [
            'submission' => $submission,
            'assignments' => $assignments,
            'criteria' => $criteriaScores,
            'reviewerSummaries' => $reviewerSummaries,
            'reviewerIds' => $reviewerIds,
        ]);
    }
}