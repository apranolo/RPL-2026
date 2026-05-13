<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Notifications\AssessmentApprovedNotification;
use App\Notifications\AssessmentRevisionRequestedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    /**
     * Display assessments from Admin Kampus's university.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->input('status');
        $search = $request->input('search');
        $period = $request->input('period'); // NEW: filter by period
        $year = $request->input('year'); // NEW: filter by year
        $approvalStatus = $request->input('approval_status'); // NEW: filter by approval status

        $assessments = JournalAssessment::with([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'adminKampusApprover',
        ])
            ->whereHas('journal', function ($query) use ($user) {
                $query->where('university_id', $user->university_id);
            })
            ->when($status, function ($query, $status) {
                $query->byStatus($status);
            })
            ->when($search, function ($query, $search) {
                $query->whereHas('journal', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('issn', 'like', "%{$search}%");
                });
            })
            ->when($period, function ($query, $period) {
                $query->where('period', $period);
            })
            ->when($year, function ($query, $year) {
                $query->whereYear('assessment_date', $year);
            })
            ->when($approvalStatus, function ($query, $approvalStatus) {
                if ($approvalStatus === 'approved') {
                    $query->whereNotNull('admin_kampus_approved_at')
                        ->where('status', '!=', 'draft');
                } elseif ($approvalStatus === 'pending') {
                    $query->where('status', 'submitted')
                        ->whereNull('admin_kampus_approved_at');
                } elseif ($approvalStatus === 'rejected') {
                    $query->where('status', 'draft')
                        ->whereNotNull('admin_kampus_approved_at');
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get available periods and years for filter dropdowns
        $availablePeriods = JournalAssessment::whereHas('journal', function ($query) use ($user) {
            $query->where('university_id', $user->university_id);
        })
            ->whereNotNull('period')
            ->distinct()
            ->pluck('period')
            ->sort()
            ->values();

        $availableYears = JournalAssessment::whereHas('journal', function ($query) use ($user) {
            $query->where('university_id', $user->university_id);
        })
            ->selectRaw('DISTINCT YEAR(assessment_date) as year')
            ->whereNotNull('assessment_date')
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('AdminKampus/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'period' => $period,
                'year' => $year,
                'approval_status' => $approvalStatus,
            ],
            'availablePeriods' => $availablePeriods,
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Display assessment detail for review.
     */
    public function show(Request $request, JournalAssessment $assessment): Response
    {
        $this->authorize('view', $assessment);

        $assessment->load([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'assessmentNotes.user',
            'responses.evaluationIndicator.subCategory.category',
            'responses.attachments',
        ]);

        return Inertia::render('AdminKampus/Assessments/Show', [
            'assessment' => $assessment,
        ]);
    }

    /**
     * Display review page for submitted assessment.
     */
    public function review(Request $request, JournalAssessment $assessment): Response
    {
        $this->authorize('review', $assessment);

        $assessment->load([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'responses.evaluationIndicator.subCategory.category',
            'responses.attachments',
            'issues' => function ($query) {
                $query->orderBy('display_order')->orderBy('created_at');
            },
        ]);

        return Inertia::render('AdminKampus/Assessments/Review', [
            'assessment' => $assessment,
        ]);
    }

    /**
     * Approve assessment as Admin Kampus (LPPM).
     * After approval, assessment is ready for Dikti to assign reviewer.
     */
    public function approve(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $assessment->update([
            'status' => 'reviewed', // Admin Kampus approved, assessment reviewed
            'admin_kampus_approved_by' => $request->user()->id,
            'admin_kampus_approved_at' => now(),
            'admin_kampus_approval_notes' => $validated['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Create assessment note for timeline
        $assessment->assessmentNotes()->create([
            'user_id' => $request->user()->id,
            'author_role' => 'Admin Kampus',
            'note_type' => 'approval',
            'content' => $validated['admin_notes'] ?? 'Assessment disetujui oleh Admin Kampus (LPPM)',
        ]);

        // Send notification to user
        $assessment->user->notify(
            new AssessmentApprovedNotification($assessment, $validated['admin_notes'] ?? null)
        );

        return redirect()
            ->route('admin-kampus.assessments.index')
            ->with('success', 'Assessment berhasil disetujui. Menunggu assignment reviewer dari Dikti.');
    }

    /**
     * Reject assessment - send assessment back to draft status.
     * Admin Kampus (LPPM) requests revision with notes.
     */
    public function requestRevision(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $assessment->update([
            'status' => 'draft',
            'admin_kampus_approved_by' => $request->user()->id,
            'admin_kampus_approved_at' => now(),
            'admin_kampus_approval_notes' => $validated['admin_notes'],
        ]);

        // Create assessment note for timeline
        $assessment->assessmentNotes()->create([
            'user_id' => $request->user()->id,
            'author_role' => 'Admin Kampus',
            'note_type' => 'rejection',
            'content' => $validated['admin_notes'],
        ]);

        // Send notification to user
        $assessment->user->notify(
            new AssessmentRevisionRequestedNotification($assessment, $validated['admin_notes'])
        );

        return redirect()
            ->route('admin-kampus.assessments.index')
            ->with('success', 'Assessment ditolak. User akan menerima notifikasi untuk revisi.');
    }
}
