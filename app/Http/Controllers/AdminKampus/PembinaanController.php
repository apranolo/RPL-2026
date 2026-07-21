<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\PembinaanRegistration;
use App\Models\ReviewerAssignment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembinaanController extends Controller
{
    /**
     * Display Akreditasi registrations from the admin's university.
     */
    public function indexAkreditasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'akreditasi');
    }

    /**
     * Display Indeksasi registrations from the admin's university.
     */
    public function indexIndeksasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'indeksasi');
    }

    /**
     * Common method to display registrations by category.
     */
    private function indexByCategory(Request $request, string $category): Response
    {
        $this->authorize('viewAny', PembinaanRegistration::class);

        $user = $request->user();

        // Guard: Admin Kampus must have a university assigned
        abort_if(
            is_null($user->university_id),
            403,
            'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
        );

        $query = PembinaanRegistration::with([
            'pembinaan',
            'journal',
            'user',
            'reviewer',
        ])->forUniversity($user->university_id)
            ->whereHas('pembinaan', function ($q) use ($category) {
                $q->where('category', $category);
            });

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('pembinaan_id')) {
            $query->forPembinaan($request->pembinaan_id);
        }

        if ($request->filled('search')) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('issn', 'like', "%{$request->search}%");
            });
        }

        $registrations = $query->orderBy('registered_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('AdminKampus/Pembinaan/Index', [
            'registrations' => $registrations,
            'filters' => [
                'status' => $request->status,
                'pembinaan_id' => $request->pembinaan_id,
                'search' => $request->search,
            ],
            'category' => $category,
        ]);
    }

    /**
     * Display a specific registration detail.
     */
    public function show(PembinaanRegistration $registration): Response
    {
        $this->authorize('view', $registration);

        $registration->load([
            'pembinaan.accreditationTemplate',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'attachments.uploader',
            'reviews.reviewer',
            'reviewerAssignments.reviewer',
            'reviewerAssignments.assigner',
        ]);

        return Inertia::render('AdminKampus/Pembinaan/Show', [
            'registration' => $registration,
            'category' => $registration->pembinaan->category,
        ]);
    }

    /**
     * Approve a registration.
     */
    public function approve(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('approve', $registration);

        $registration->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'rejection_reason' => null,
            'updated_by' => $request->user()->id,
        ]);

        // TODO: Send email notification to user

        return back()->with('success', 'Registration approved successfully.');
    }

    /**
     * Reject a registration.
     */
    public function reject(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('reject', $registration);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $registration->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'rejection_reason' => $validated['rejection_reason'],
            'updated_by' => $request->user()->id,
        ]);

        // TODO: Send email notification to user

        return back()->with('success', 'Registration rejected.');
    }

    /**
     * Assign a reviewer to a registration.
     */
    public function assignReviewer(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('create', ReviewerAssignment::class);

        $validated = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
        ]);

        // Use policy to validate assignment
        $this->authorize('assign', [
            ReviewerAssignment::class,
            $request->user()->id,
            $registration->id,
            $validated['reviewer_id'],
        ]);

        ReviewerAssignment::create([
            'reviewer_id' => $validated['reviewer_id'],
            'registration_id' => $registration->id,
            'assigned_by' => $request->user()->id,
            'status' => 'assigned',
        ]);

        // TODO: Send email notification to reviewer

        return back()->with('success', 'Reviewer assigned successfully.');
    }

    /**
     * Remove a reviewer assignment.
     */
    public function removeAssignment(Request $request, ReviewerAssignment $assignment): RedirectResponse
    {
        $this->authorize('delete', $assignment);

        if ($assignment->isCompleted()) {
            return back()->with('error', 'Cannot remove completed assignment.');
        }

        $assignment->delete();

        return back()->with('success', 'Reviewer assignment removed.');
    }

    /**
     * Get available reviewers for assignment dropdown.
     */
    public function getReviewers(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        // Get users with Reviewer role from same university
        $reviewers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Reviewer');
        })
            ->where('university_id', $user->university_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($reviewers);
    }
}
