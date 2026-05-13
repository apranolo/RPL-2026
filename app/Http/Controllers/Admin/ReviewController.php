<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Services\ReviewCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display a listing of Reviewers.
     *
     * v1.1 feature - Reviewer management placeholder
     */
    public function summary(Request $request, ReviewCalculationService $reviewCalculationService): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string'],
        ]);

        $proposals = Proposal::query()
            ->with([
                'researcher:id,name',
                'reviews:id,proposal_id,reviewer_id,score,notes',
                'reviews.reviewer:id,name',
            ])
            ->whereHas('reviews')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhereHas('researcher', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $proposals->through(function ($proposal) use ($reviewCalculationService) {
            $calculation = $reviewCalculationService->calculate($proposal);

            return [
                'id' => $proposal->id,
                'title' => $proposal->title,
                'researcher_name' => $proposal->researcher?->name,
                'review_count' => $calculation['review_count'],
                'average_score' => $calculation['average_score'],
                'min_score' => $calculation['min_score'],
                'max_score' => $calculation['max_score'],
                'recommendation' => $calculation['recommendation'],
                'status' => $proposal->decision_status,
            ];
        });

        return Inertia::render('Admin/Reviewer/Summary', [
            'title' => 'Rekap Hasil Review',
            'filters' => $filters,
            'proposals' => $proposals,
        ]);
    }

    public function index(): Response
    {
        // Only Super Admin can access
        $this->authorize('manage-users');

        return Inertia::render('Admin/Reviewers/Index');
    }
}
