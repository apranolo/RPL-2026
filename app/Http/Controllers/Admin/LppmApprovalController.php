<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Handle LPPM Admin registration approval workflow for Super Admin (Dikti).
 *
 * @route /admin/users/{user}/approve-lppm
 * @route /admin/users/{user}/reject-lppm
 * @route /admin/users/{user}/revert-lppm
 *
 * @features Approve/reject LPPM registrations, assign Admin Kampus role, revert decisions
 */
class LppmApprovalController extends Controller
{
    /**
     * Approve an LPPM Admin registration and assign Admin Kampus role.
     *
     * @route POST /admin/users/{user}/approve-lppm
     */
    public function approve(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        // Ensure user is pending LPPM registration (role_id is null)
        if ($user->role_id !== null) {
            return back()->with('error', 'User bukan pendaftar LPPM atau sudah memiliki role.');
        }

        // Prevent approving already approved users
        if ($user->approval_status === 'approved') {
            return back()->with('error', 'LPPM Admin sudah disetujui sebelumnya.');
        }

        // Get Admin Kampus role
        $adminKampusRole = Role::where('name', Role::ADMIN_KAMPUS)->first();

        if (! $adminKampusRole) {
            return back()->with('error', 'Role Admin Kampus tidak ditemukan di sistem.');
        }

        $user->update([
            'role_id' => $adminKampusRole->id,
            'approval_status' => 'approved',
            'is_active' => true, // Auto-activate: LPPM dapat login langsung
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // TODO: Send LppmApprovedNotification
        // $user->notify(new LppmApprovedNotification());

        return redirect()
            ->route('admin.admin-kampus.index')
            ->with('success', "LPPM Admin {$user->name} disetujui dan diberi role Admin Kampus.");
    }

    /**
     * Reject an LPPM Admin registration with reason.
     *
     * @route POST /admin/users/{user}/reject-lppm
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

        // Ensure user is pending LPPM registration
        if ($user->role_id !== null) {
            return back()->with('error', 'User bukan pendaftar LPPM atau sudah memiliki role.');
        }

        // Prevent rejecting already processed users
        if ($user->approval_status !== 'pending') {
            return back()->with('error', 'LPPM Admin sudah diproses sebelumnya.');
        }

        $user->update([
            'approval_status' => 'rejected',
            'is_active' => false,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->reason,
        ]);

        // TODO: Send LppmRejectedNotification
        // $user->notify(new LppmRejectedNotification($request->reason));

        return redirect()
            ->route('admin.admin-kampus.index')
            ->with('success', "LPPM Admin {$user->name} ditolak dan tidak akan muncul di daftar utama.");
    }

    /**
     * Revert LPPM Admin approval decision (approved/rejected → pending).
     * Allows Dikti to correct mistakes or reconsider decisions.
     *
     * @route POST /admin/users/{user}/revert-lppm
     */
    public function revert(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        // Only allow reverting approved or rejected LPPM registrations
        if (! in_array($user->approval_status, ['approved', 'rejected'])) {
            return back()->with('error', 'Hanya LPPM yang sudah diapprove atau ditolak yang bisa di-revert.');
        }

        // If reverting approved user, remove role
        if ($user->approval_status === 'approved') {
            $user->update([
                'role_id' => null, // Remove Admin Kampus role
                'approval_status' => 'pending',
                'is_active' => false,
                'approved_by' => null,
                'approved_at' => null,
                'rejection_reason' => null,
            ]);

            return redirect()
                ->route('admin.admin-kampus.index')
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
            ->route('admin.admin-kampus.index')
            ->with('success', "Rejection {$user->name} berhasil di-revert. User kembali ke status pending.");
    }
}
