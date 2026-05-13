<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\JournalReassignment;
use App\Models\ScientificField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    /**
     * Display the user profile dashboard.
     *
     * Shows comprehensive profile information including:
     * - User profile & contact details
     * - Statistics (journals, assessments, scores)
     * - Managed journals list
     * - Activity history (reassignments)
     * - Notifications
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Load relationships
        $user->load([
            'role',
            'university',
            'scientificField',
            'journals.scientificField',
            'journals.latestAssessment',
        ]);

        // Get statistics with caching
        $statistics = $this->getUserStatistics($user->id);

        // Get recent activity (journal reassignments)
        $recentActivity = $this->getRecentActivity($user->id);

        // Get notifications
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'data' => $notification->data,
                'read_at' => $notification->read_at?->format('Y-m-d H:i:s'),
                'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
            ]);

        $unreadNotificationsCount = $user->unreadNotifications()->count();

        // Format user data
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'position' => $user->position,
            'avatar_url' => $user->avatar_url,
            'initials' => $user->initials,
            'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
            'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
            'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            'university' => $user->university ? [
                'id' => $user->university->id,
                'name' => $user->university->name,
                'short_name' => $user->university->short_name,
            ] : null,
            'scientific_field' => $user->scientificField ? [
                'id' => $user->scientificField->id,
                'name' => $user->scientificField->name,
                'code' => $user->scientificField->code,
            ] : null,
        ];

        // Format journals data
        $journals = $user->journals->map(fn ($journal) => [
            'id' => $journal->id,
            'title' => $journal->title,
            'issn' => $journal->issn,
            'e_issn' => $journal->e_issn,
            'url' => $journal->url,
            'approval_status' => $journal->approval_status,
            'is_active' => $journal->is_active,
            'scientific_field' => $journal->scientificField ? [
                'id' => $journal->scientificField->id,
                'name' => $journal->scientificField->name,
                'code' => $journal->scientificField->code,
            ] : null,
            'latest_assessment' => $journal->latestAssessment ? [
                'id' => $journal->latestAssessment->id,
                'total_score' => $journal->latestAssessment->total_score,
                'status' => $journal->latestAssessment->status,
                'submitted_at' => $journal->latestAssessment->submitted_at?->format('Y-m-d'),
            ] : null,
            'created_at' => $journal->created_at->format('Y-m-d'),
        ]);

        return Inertia::render('User/Profil/Index', [
            'user' => $userData,
            'statistics' => $statistics,
            'journals' => $journals,
            'recentActivity' => $recentActivity,
            'notifications' => $notifications,
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ]);
    }

    /**
     * Get user statistics with caching.
     */
    private function getUserStatistics(int $userId): array
    {
        $cacheKey = "profile_stats_user_{$userId}";

        return Cache::remember($cacheKey, 3600, function () use ($userId) {
            $totalJournals = DB::table('journals')
                ->where('user_id', $userId)
                ->count();

            $totalAssessments = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $userId)
                ->count();

            $avgScore = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $userId)
                ->whereNotNull('journal_assessments.total_score')
                ->avg('journal_assessments.total_score');

            $journalsByStatus = [
                'pending' => DB::table('journals')
                    ->where('user_id', $userId)
                    ->where('approval_status', 'pending')
                    ->count(),
                'approved' => DB::table('journals')
                    ->where('user_id', $userId)
                    ->where('approval_status', 'approved')
                    ->count(),
                'rejected' => DB::table('journals')
                    ->where('user_id', $userId)
                    ->where('approval_status', 'rejected')
                    ->count(),
            ];

            return [
                'total_journals' => $totalJournals,
                'total_assessments' => $totalAssessments,
                'average_score' => $avgScore ? round($avgScore, 2) : 0.0,
                'journals_by_status' => $journalsByStatus,
            ];
        });
    }

    /**
     * Get recent activity (journal reassignments).
     */
    private function getRecentActivity(int $userId): array
    {
        $reassignments = JournalReassignment::with(['journal', 'fromUser', 'toUser', 'reassignedBy'])
            ->where(function ($query) use ($userId) {
                $query->where('from_user_id', $userId)
                    ->orWhere('to_user_id', $userId);
            })
            ->latest()
            ->limit(10)
            ->get();

        return $reassignments->map(fn ($reassignment) => [
            'id' => $reassignment->id,
            'type' => $reassignment->to_user_id === $userId ? 'received' : 'transferred',
            'journal' => [
                'id' => $reassignment->journal->id,
                'title' => $reassignment->journal->title,
            ],
            'from_user' => $reassignment->fromUser ? [
                'id' => $reassignment->fromUser->id,
                'name' => $reassignment->fromUser->name,
            ] : null,
            'to_user' => $reassignment->toUser ? [
                'id' => $reassignment->toUser->id,
                'name' => $reassignment->toUser->name,
            ] : null,
            'reassigned_by' => $reassignment->reassignedBy ? [
                'id' => $reassignment->reassignedBy->id,
                'name' => $reassignment->reassignedBy->name,
            ] : null,
            'reason' => $reassignment->reason,
            'created_at' => $reassignment->created_at->format('Y-m-d H:i:s'),
        ])->toArray();
    }

    /**
     * Show the profile edit form for the authenticated user (User role area).
     */
    public function edit(Request $request): Response
    {
        $scientificFields = ScientificField::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('User/Profil/Edit', [
            'scientificFields' => $scientificFields,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the authenticated user's profile (User role area).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        self::clearStatisticsCache($user->id);

        return to_route('user.profil.index')
            ->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        $user->notifications()
            ->where('id', $id)
            ->update(['read_at' => now()]);

        return back()->with('success', 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllNotificationsAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read');
    }

    /**
     * Clear user statistics cache.
     */
    public static function clearStatisticsCache(int $userId): void
    {
        Cache::forget("profile_stats_user_{$userId}");
    }
}
