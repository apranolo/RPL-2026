<?php

namespace App\Http\Middleware;

use App\Models\Journal;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user us authenticated
        if (! $request->user()) {
            return redirect()->route('login')
                ->with('error', 'You must be logged in to access this page.');
        }

        // Check if user is active
        if (! $request->user()->is_active) {
            auth()->logout();

            return redirect()->route('login')
                ->with('error', 'Your account has been deactivated. Please contact the administrator.');
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

        if ($request->user()->isSuperAdmin() && $journalId) {
            return $next($request);
        }

        if ($request->user()->isAdminKampus() && $journalId) {
            $journalModel = Journal::find($journalId);
            if ($journalModel && $journalModel->university_id === $request->user()->university_id) {
                return $next($request);
            }
        }

        // Check if user has any of the required roles (supports multi-role)
        if (! $request->user()->hasAnyRole($roles)) {
            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
