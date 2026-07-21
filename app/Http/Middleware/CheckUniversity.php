<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUniversity
{
    /**
     * Handle an incoming request.
     *
     * Middleware ini memastikan:
     * - Super Admin: bypass (bisa akses semua)
     * - Admin Kampus & User: hanya bisa akses data dari university mereka
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

        // Super Admin bypass - can access all universities
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user belongs to a university
        if (! $user->university_id) {
            abort(403, 'Your account is not associated with any university. Please contact administrator.');
        }

        // Get university_id from route parameter (if exists)
        $routeUniversityId = $request->route('university')
            ? $request->route('university')->id
            : null;

        // If route has university parameter, check if it matches user's university
        if ($routeUniversityId && $routeUniversityId != $user->university_id) {
            abort(403, 'You do not have permission to access this university data.');
        }

        // Get university_id from request data (for create/update operations)
        $requestUniversityId = $request->input('university_id');

        // If request has university_id, check if it matches user's university
        if ($requestUniversityId && $requestUniversityId != $user->university_id) {
            abort(403, 'You cannot create/update data for another university.');
        }

        return $next($request);
    }
}
