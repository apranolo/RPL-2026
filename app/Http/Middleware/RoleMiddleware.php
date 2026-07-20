<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login')
                ->with('error', 'You must be logged in to access this page.');
        }

        if (! $user->is_active) {
            auth()->logout();

            return redirect()->route('login')
                ->with('error', 'Your account has been deactivated.');
        }

        $journal = $request->route('journal') ?? $request->input('journal');
        $journalId = null;

        if ($journal) {
            if (is_object($journal)) {
                $journalId = $journal->id;
            } elseif (is_numeric($journal)) {
                $journalId = (int) $journal;
            }
        }

        if (! $journalId) {
            $resolvedId = $request->route('journal_id')
                ?? $request->input('journal_id')
                ?? $request->route('id_journal')
                ?? $request->input('id_journal');

            if ($resolvedId && ! is_array($resolvedId)) {
                $journalId = (int) $resolvedId;
            }
        }

        if ($journalId) {
            foreach ($roles as $role) {
                if ($user->hasJournalRole($role, $journalId)) {
                    return $next($request);
                }
            }
        } else {
            foreach ($roles as $role) {
                if ($user->hasRoleInAnyJournal($role)) {
                    return $next($request);
                }

                if ($user->hasRole($role)) {
                    return $next($request);
                }
            }
        }

        abort(403, 'Unauthorized. You do not have the required role for this journal.');
    }
}
