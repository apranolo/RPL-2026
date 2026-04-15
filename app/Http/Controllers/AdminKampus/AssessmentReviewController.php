<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssessmentReviewController extends Controller
{
    /**
     * Display a listing of assessments for review
     *
     * @route GET /admin-kampus/assessments/review
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = JournalAssessment::query()
            ->whereHas('journal', function ($q) use ($user) {
                $q->where('university_id', $user->university_id);
            })
            ->with(['journal', 'user', 'reviewer']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        } else {
            // Default: show submitted assessments (pending review)
            $query->where('status', 'submitted');
        }

        // Search by journal title
        if ($request->has('search') && $request->search) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            });
        }

        $assessments = $query
            ->latest('submitted_at')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'journal' => [
                        'id' => $assessment->journal->id,
                        'title' => $assessment->journal->title,
                        'issn' => $assessment->journal->issn,
                    ],
                    'user' => [
                        'id' => $assessment->user->id,
                        'name' => $assessment->user->name,
                        'email' => $assessment->user->email,
                    ],
                    'status' => $assessment->status,
                    'submitted_at' => $assessment->submitted_at?->format('Y-m-d H:i:s'),
                    'reviewed_at' => $assessment->reviewed_at?->format('Y-m-d H:i:s'),
                    'reviewer' => $assessment->reviewer ? [
                        'id' => $assessment->reviewer->id,
                        'name' => $assessment->reviewer->name,
                    ] : null,
                ];
            });

        return Inertia::render('AdminKampus/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the assessment for review
     *
     * @route GET /admin-kampus/assessments/{assessment}/review
     */
    public function show(JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('review', $assessment);

        $assessment->load([
            'journal',
            'user',
            'responses.evaluationIndicator',
            'issues' => function ($query) {
                $query->ordered();
            },
            'attachments',
            'reviewer',
        ]);

        return Inertia::render('AdminKampus/Assessments/Review', [
            'assessment' => $assessment,
        ]);
    }

    /**
     * Approve the assessment
     *
     * @route POST /admin-kampus/assessments/{assessment}/approve
     */
    public function approve(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('review', $assessment);

        if ($assessment->status !== 'submitted') {
            return back()->with('error', 'Hanya assessment dengan status submitted yang dapat disetujui.');
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|min:50',
        ]);

        DB::beginTransaction();
        try {
            $assessment->update([
                'status' => 'reviewed',
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // TODO: Send notification to user
            // $assessment->user->notify(new AssessmentApprovedNotification($assessment));

            DB::commit();

            return redirect()
                ->route('admin-kampus.assessments.review.index')
                ->with('success', 'Assessment berhasil disetujui.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to approve assessment', [
                'assessment_id' => $assessment->id,
                'admin_id' => auth()->id(),
                'exception' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal menyetujui assessment: '.$e->getMessage());
        }
    }

    /**
     * Request revision for the assessment
     *
     * @route POST /admin-kampus/assessments/{assessment}/request-revision
     */
    public function requestRevision(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('review', $assessment);

        if ($assessment->status !== 'submitted') {
            return back()->with('error', 'Hanya assessment dengan status submitted yang dapat diminta revisi.');
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|min:50',
        ]);

        DB::beginTransaction();
        try {
            $assessment->update([
                'status' => 'draft', // Change back to draft so user can edit
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // TODO: Send notification to user
            // $assessment->user->notify(new AssessmentRevisionRequestedNotification($assessment));

            DB::commit();

            return redirect()
                ->route('admin-kampus.assessments.review.index')
                ->with('success', 'Permintaan revisi berhasil dikirim.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to request revision', [
                'assessment_id' => $assessment->id,
                'admin_id' => auth()->id(),
                'exception' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal mengirim permintaan revisi: '.$e->getMessage());
        }
    }
}
