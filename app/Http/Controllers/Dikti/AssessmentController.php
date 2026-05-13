<?php

namespace App\Http\Controllers\Dikti;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dikti Assessment Controller
 *
 * Handles reviewer assignment for assessments that have been approved by Admin Kampus (LPPM).
 * Only Dikti role can assign reviewers to assessments.
 */
class AssessmentController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Ensure only Super Admin can access Dikti routes
        $this->middleware(function ($request, $next) {
            if (! $request->user() || ! $request->user()->isSuperAdmin()) {
                abort(403, 'Unauthorized access to Dikti assessment management.');
            }

            return $next($request);
        });
    }

    /**
     * Display assessments pending reviewer assignment.
     *
     * @route GET /dikti/assessments
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'approved_by_lppm');
        $search = $request->input('search');

        $assessments = JournalAssessment::with([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'adminKampusApprover', // Admin who approved
        ])
            ->when($status, function ($query, $status) {
                if ($status === 'pending_assignment') {
                    $query->where('status', 'approved_by_lppm')
                        ->whereNull('reviewer_id');
                } elseif ($status === 'assigned') {
                    $query->whereNotNull('reviewer_id')
                        ->whereIn('status', ['approved_by_lppm', 'in_review']);
                } else {
                    $query->where('status', $status);
                }
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('journal', function ($subQ) use ($search) {
                        $subQ->where('title', 'like', "%{$search}%")
                            ->orWhere('issn', 'like', "%{$search}%");
                    })
                        ->orWhereHas('journal.university', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('admin_kampus_approved_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Dikti/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display assessment detail for reviewer assignment.
     *
     * @route GET /dikti/assessments/{assessment}
     */
    public function show(Request $request, JournalAssessment $assessment): Response
    {
        $this->authorize('assignReviewer', $assessment);

        $assessment->load([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'adminKampusApprover',
            'responses.evaluationIndicator',
            'assessmentNotes' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
        ]);

        // Get available reviewers (users with Reviewer role)
        $availableReviewers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Reviewer');
        })
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'scientific_field_id')
            ->with('scientificField:id,name')
            ->get();

        return Inertia::render('Dikti/Assessments/Show', [
            'assessment' => $assessment,
            'availableReviewers' => $availableReviewers,
        ]);
    }

    /**
     * Assign reviewer to assessment.
     *
     * @route POST /dikti/assessments/{assessment}/assign-reviewer
     */
    public function assignReviewer(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('assignReviewer', $assessment);

        $validated = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'assignment_notes' => 'nullable|string|max:500',
        ]);

        // Verify the selected user is a reviewer
        $reviewer = User::findOrFail($validated['reviewer_id']);
        if (! $reviewer->hasRole('Reviewer')) {
            return back()->withErrors(['reviewer_id' => 'Selected user is not a reviewer.']);
        }

        // Assign reviewer
        $assessment->update([
            'reviewer_id' => $validated['reviewer_id'],
            'status' => 'in_review',
            'assigned_by' => $request->user()->id,
            'assigned_at' => now(),
        ]);

        // Create assessment note for timeline
        $assessment->assessmentNotes()->create([
            'user_id' => $request->user()->id,
            'author_role' => 'Dikti',
            'note_type' => 'general',
            'content' => "Reviewer ditugaskan: {$reviewer->name}. ".($validated['assignment_notes'] ?? ''),
        ]);

        // TODO: Send notification to reviewer
        // $reviewer->notify(new ReviewerAssignedNotification($assessment));

        return redirect()
            ->route('dikti.assessments.index')
            ->with('success', "Reviewer {$reviewer->name} berhasil ditugaskan untuk assessment ini.");
    }

    /**
     * Remove reviewer assignment.
     *
     * @route POST /dikti/assessments/{assessment}/remove-reviewer
     */
    public function removeReviewer(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('assignReviewer', $assessment);

        $validated = $request->validate([
            'removal_reason' => 'nullable|string|max:500',
        ]);

        $previousReviewerName = $assessment->reviewer?->name ?? 'Unknown';

        $assessment->update([
            'reviewer_id' => null,
            'status' => 'approved_by_lppm', // Back to waiting for reviewer assignment
            'assigned_by' => null,
            'assigned_at' => null,
        ]);

        // Create assessment note for timeline
        $assessment->assessmentNotes()->create([
            'user_id' => $request->user()->id,
            'author_role' => 'Dikti',
            'note_type' => 'general',
            'content' => "Reviewer {$previousReviewerName} dihapus dari assignment. ".($validated['removal_reason'] ?? ''),
        ]);

        return redirect()
            ->route('dikti.assessments.show', $assessment)
            ->with('success', 'Reviewer assignment berhasil dihapus.');
    }
}
