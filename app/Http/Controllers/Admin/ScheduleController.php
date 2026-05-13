<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Models\ReviewSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ReviewSchedule::class);

        $query = ReviewSchedule::with(['proposal.journal', 'proposal.user', 'reviewer', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('proposal.journal', function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            })->orWhereHas('reviewer', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $schedules = $query->orderBy('scheduled_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Reviewer/Schedule', [
            'schedules' => $schedules,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ReviewSchedule::class);

        $assessments = JournalAssessment::with(['journal', 'user'])
            ->submitted()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'journal_id', 'user_id', 'status']);

        $reviewers = User::where('is_reviewer', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Reviewer/ScheduleCreate', [
            'assessments' => $assessments,
            'reviewers' => $reviewers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ReviewSchedule::class);

        $validated = $request->validate([
            'journal_assessment_id' => 'required|exists:journal_assessments,id',
            'reviewer_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'ended_at' => 'nullable|date|after:scheduled_at',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['status'] = 'scheduled';
        $validated['created_by'] = $request->user()->id;

        ReviewSchedule::create($validated);

        return redirect()
            ->route('admin.schedules.index')
            ->with('success', 'Review schedule created successfully.');
    }

    public function show(ReviewSchedule $schedule): Response
    {
        $this->authorize('view', $schedule);

        $schedule->load(['proposal.journal', 'proposal.user', 'reviewer', 'creator', 'updater']);

        return Inertia::render('Admin/Reviewer/ScheduleShow', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(ReviewSchedule $schedule): Response
    {
        $this->authorize('update', $schedule);

        $assessments = JournalAssessment::with(['journal', 'user'])
            ->submitted()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'journal_id', 'user_id', 'status']);

        $reviewers = User::where('is_reviewer', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Reviewer/ScheduleEdit', [
            'schedule' => $schedule->load(['proposal.journal', 'proposal.user', 'reviewer']),
            'assessments' => $assessments,
            'reviewers' => $reviewers,
        ]);
    }

    public function update(Request $request, ReviewSchedule $schedule): RedirectResponse
    {
        $this->authorize('update', $schedule);

        $validated = $request->validate([
            'journal_assessment_id' => 'required|exists:journal_assessments,id',
            'reviewer_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'ended_at' => 'nullable|date|after:scheduled_at',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:500',
            'notes' => 'nullable|string|max:1000',
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        $validated['updated_by'] = $request->user()->id;
        $schedule->update($validated);

        return redirect()
            ->route('admin.schedules.index')
            ->with('success', 'Review schedule updated successfully.');
    }

    public function destroy(ReviewSchedule $schedule): RedirectResponse
    {
        $this->authorize('delete', $schedule);

        $schedule->delete();

        return redirect()
            ->route('admin.schedules.index')
            ->with('success', 'Review schedule deleted successfully.');
    }
}
