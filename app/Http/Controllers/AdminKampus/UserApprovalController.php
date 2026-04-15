<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handle user registration approval workflow for Admin Kampus.
 *
 * @route /admin-kampus/users/pending
 *
 * @features View pending users, approve/reject registrations, send notifications
 */
class UserApprovalController extends Controller
{
    /**
     * Display pending user registrations awaiting approval.
     *
     * @route GET /admin-kampus/users/pending
     */
    public function index(Request $request): Response
    {
        $this->authorize('approveUsers', User::class);

        $query = User::query()
            ->where('university_id', auth()->user()->university_id)
            ->where('approval_status', 'pending')
            ->with(['role', 'university']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('AdminKampus/Users/PendingApproval', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Approve a user registration.
     *
     * @route POST /admin-kampus/users/{user}/approve
     */
    public function approve(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        // Ensure LPPM can only approve users from their university
        if ($user->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized - User is not from your university');
        }

        // Prevent approving already approved users
        if ($user->approval_status === 'approved') {
            return back()->with('error', 'User sudah disetujui sebelumnya.');
        }

        $user->update([
            'approval_status' => 'approved',
            'is_active' => true, // ✅ Auto-activate: User dapat login langsung
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // TODO: Send UserApprovedNotification
        // $user->notify(new UserApprovedNotification());

        return redirect()
            ->route('admin-kampus.users.index')
            ->with('success', "User {$user->name} disetujui dan sekarang dapat login ke sistem.");
    }

    /**
     * Reject a user registration with reason.
     *
     * @route POST /admin-kampus/users/{user}/reject
     */
    public function reject(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'Alasan penolakan harus diisi.',
            'reason.min' => 'Alasan penolakan minimal 10 karakter.',
            'reason.max' => 'Alasan penolakan maksimal 500 karakter.',
        ]);

        $this->authorize('approve', $user);

        // Ensure LPPM can only reject users from their university
        if ($user->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized - User is not from your university');
        }

        // Prevent rejecting already processed users
        if ($user->approval_status !== 'pending') {
            return back()->with('error', 'User sudah diproses sebelumnya.');
        }

        $user->update([
            'approval_status' => 'rejected',
            'is_active' => false, // ✅ Set inactive: User tidak dapat login
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->reason,
        ]);

        // TODO: Send UserRejectedNotification
        // $user->notify(new UserRejectedNotification($request->reason));

        return redirect()
            ->route('admin-kampus.users.index')
            ->with('success', "User {$user->name} ditolak. Record disimpan untuk audit trail.");
    }

    /**
     * Revert user approval decision (approved/rejected → pending).
     * Allows LPPM to correct mistakes or reconsider decisions.
     *
     * @route POST /admin-kampus/users/{user}/revert
     */
    public function revert(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        // Ensure LPPM can only revert users from their university
        if ($user->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized - User is not from your university');
        }

        // Only allow reverting approved or rejected users
        if (! in_array($user->approval_status, ['approved', 'rejected'])) {
            return back()->with('error', 'Hanya user yang sudah diapprove atau ditolak yang bisa di-revert.');
        }

        // If reverting approved user, deactivate
        if ($user->approval_status === 'approved') {
            $user->update([
                'approval_status' => 'pending',
                'is_active' => false,
                'approved_by' => null,
                'approved_at' => null,
                'rejection_reason' => null,
            ]);

            return redirect()
                ->route('admin-kampus.users.index')
                ->with('success', "Approval {$user->name} berhasil di-revert. User kembali ke status pending.");
        }

        // If reverting rejected user, reset to pending
        $user->update([
            'approval_status' => 'pending',
            'is_active' => false,
            'approved_by' => null,
            'approved_at' => null,
            'rejection_reason' => null,
        ]);

        return redirect()
            ->route('admin-kampus.users.index')
            ->with('success', "Rejection {$user->name} berhasil di-revert. User kembali ke status pending.");
    }
}
