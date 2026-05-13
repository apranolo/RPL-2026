<?php

namespace App\Http\Controllers\Review;
use Inertia\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewAssignment;
use Illuminate\Http\Request;

class ReviewSummaryController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => ['required', 'integer'],
        ]);

        $subjectId = (int) $validated['subject_id'];

        $assignments = ReviewAssignment::query()
            ->with([
                'reviewer:id,name',
            ])
            ->where('subject_id', $subjectId)
            ->orderBy('reviewer_id')
            ->get(['id', 'subject_id', 'reviewer_id']);

        $reviewerList = $assignments
            ->map(fn ($a) => [
                'id' => (int) $a->reviewer_id,
                'name' => $a->reviewer?->name ?? ('Reviewer #' . $a->reviewer_id),
            ])
            ->values();

        $assignmentIds = $assignments->pluck('id')->values();

        $reviews = Review::query()
            ->with(['reviewAssignment:id,reviewer_id'])
            ->whereIn('review_assignment_id', $assignmentIds)
            ->get(['id', 'review_assignment_id', 'criterion_name', 'score', 'notes']);

        $criteriaSet = [];
        foreach ($reviews as $r) {
            $criteriaSet[$r->criterion_name] = true;
        }
        $criteria = array_keys($criteriaSet);
        sort($criteria);

        // Build matrix data: criterion_name -> reviewer_id -> { score, note }
        $cells = [];
        foreach ($reviews as $r) {
            $reviewerId = $r->reviewAssignment?->reviewer_id;
            if ($reviewerId === null) {
                continue;
            }

            $cells[(string) $r->criterion_name][(string) $reviewerId] = [
                'score' => $r->score,
                'note' => $r->notes,
            ];
        }

        return Inertia::render('Review/Summary', [
            'subject' => [
                'id' => $subjectId,
                'label' => 'Subject #' . $subjectId,
            ],
            'reviewers' => $reviewerList,
            'criteria' => array_map(fn ($name) => ['id' => $name, 'name' => $name], $criteria),
            'cells' => $cells,
        ]);
    }
}