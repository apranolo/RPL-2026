<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    /**
     * Revoke a role from a user.
     */
    public function revoke(Request $request, User $user)
    {
        $this->authorize('manage-users');

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $roleIdToRevoke = $validated['role_id'];
        $roleToRevoke = Role::findOrFail($roleIdToRevoke);

        // Guard: Prevent removing the last role
        if ($user->roles()->count() <= 1 && $user->roles()->where('roles.id', $roleIdToRevoke)->exists()) {
            return back()->with('error', 'Cannot revoke the only role of a user. A user must have at least one role.');
        }

        // Guard: Prevent removing Super Admin from oneself
        if ($user->id === auth()->id() && $roleToRevoke->name === Role::SUPER_ADMIN) {
            return back()->with('error', 'You cannot revoke the Super Admin role from yourself.');
        }

        // Detach role from user_roles pivot table
        $user->roles()->detach($roleIdToRevoke);

        // If the revoked role was the primary role (backwards compatibility), update it
        if ($user->role_id == $roleIdToRevoke) {
            $remainingRole = $user->roles()->first();
            $user->update([
                'role_id' => $remainingRole ? $remainingRole->id : null,
            ]);
        }

        // Update is_reviewer flag if Reviewer role is revoked
        if ($roleToRevoke->name === Role::REVIEWER) {
            $user->update(['is_reviewer' => false]);
        }

        return back()->with('success', "Role '{$roleToRevoke->display_name}' has been revoked from {$user->name}.");
    }
}
