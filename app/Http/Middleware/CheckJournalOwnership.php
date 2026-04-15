<?php

namespace App\Http\Middleware;

use App\Models\Journal;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckJournalOwnership
{
    /**
     * Handle an incoming request.
     *
     * Middleware ini memastikan:
     * - Super Admin: bypass (bisa akses semua)
     * - Admin Kampus: hanya journal dari university mereka
     * - User: hanya journal milik mereka sendiri
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated
        if (! $user) {
            return redirect()->route('login');
        }

        // Super Admin bypass
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Get journal from route parameter
        $journal = $request->route('journal');

        // If no journal in route, continue (will be handled by controller)
        if (! $journal) {
            return $next($request);
        }

        // Ensure journal is Journal model instance
        if (! $journal instanceof Journal) {
            $journal = Journal::findOrFail($journal);
        }

        // Admin Kampus: check if journal belongs to their university
        if ($user->isAdminKampus()) {
            if ($journal->university_id !== $user->university_id) {
                abort(403, 'You do not have permission to access this journal.');
            }

            return $next($request);
        }

        // User: check if they own this journal
        if ($user->isUser()) {
            if ($journal->user_id !== $user->id) {
                abort(403, 'You do not have permission to access this journal.');
            }

            return $next($request);
        }

        abort(403, 'Unauthorized access.');
    }
}
