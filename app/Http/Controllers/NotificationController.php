<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ReviewerNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Notify reviewer via app (in-app notification).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function notifyReviewer(Request $request)
    {
        // Enforce authorization: only Super Admin and Admin Kampus can notify reviewers
        abort_unless(
            $request->user() && ($request->user()->isSuperAdmin() || $request->user()->isAdminKampus()),
            403,
            'Unauthorized'
        );

        $validated = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'action_url' => 'nullable|string|max:500',
            'type' => 'nullable|string|max:50',
            'source_id' => 'nullable|integer',
            'source_type' => 'nullable|string|max:100',
        ]);

        $reviewer = User::findOrFail($validated['reviewer_id']);

        // Verify the target user is a reviewer
        if (! $reviewer->isReviewer()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected user is not a reviewer.',
                ], 422);
            }
            return back()->withErrors(['reviewer_id' => 'The selected user is not a reviewer.']);
        }

        // Send database notification (in-app notification)
        $reviewer->notify(new ReviewerNotification($validated));

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully to reviewer.',
            ]);
        }

        return back()->with('success', 'Notification successfully sent to reviewer.');
    }
}
