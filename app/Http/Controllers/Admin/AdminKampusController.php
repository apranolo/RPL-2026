<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AdminKampusController extends Controller
{
    /**
     * Display a listing of Admin Kampus.
     */
    public function index(Request $request): Response
    {
        // Only Super Admin can access
        $this->authorize('manage-admin-kampus');

        // Base query for Admin Kampus only
        $query = User::query()
            ->with(['role', 'university'])
            ->whereHas('role', function ($query) {
                $query->where('name', 'Admin Kampus');
            });

        // Apply filters if any
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by University
        if ($request->has('university_id') && $request->university_id) {
            $query->where('university_id', $request->university_id);
        }

        // Filter by Active Status
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Get Admin Kampus with counts
        $adminKampus = $query
            ->withCount('journals')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($admin) => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'avatar_url' => $admin->avatar_url,
                'is_active' => $admin->is_active,
                'university' => $admin->university ? [
                    'id' => $admin->university->id,
                    'name' => $admin->university->name,
                    'short_name' => $admin->university->short_name,
                    'code' => $admin->university->code,
                ] : null,
                'journals_count' => $admin->journals_count ?? 0,
                'last_login_at' => $admin->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $admin->created_at->format('Y-m-d H:i:s'),
            ]);

        // Get all universities for filter dropdown (with cache)
        $universities = Cache::remember('universities.active.list', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']);
        });

        // Query pending LPPM registrations (role_id is null and approval_status is pending)
        $pendingLppmQuery = User::query()
            ->whereNull('role_id')
            ->where('approval_status', 'pending')
            ->with(['university']);

        // Search filter for pending LPPM
        if ($request->filled('pending_lppm_search')) {
            $search = $request->pending_lppm_search;
            $pendingLppmQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Paginate pending LPPM separately with different query string
        $pendingLppm = $pendingLppmQuery
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'lppm_page')
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'university' => $user->university ? [
                        'id' => $user->university->id,
                        'name' => $user->university->name,
                        'short_name' => $user->university->short_name,
                    ] : null,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Query rejected LPPM registrations (optional view)
        $rejectedLppmQuery = User::query()
            ->whereNull('role_id')
            ->where('approval_status', 'rejected')
            ->with(['university', 'approver']);

        // Search filter for rejected LPPM
        if ($request->filled('rejected_lppm_search')) {
            $search = $request->rejected_lppm_search;
            $rejectedLppmQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Only show rejected if explicitly requested (toggle in UI)
        $rejectedLppm = null;
        if ($request->boolean('show_rejected')) {
            $rejectedLppm = $rejectedLppmQuery
                ->orderBy('approved_at', 'desc')
                ->paginate(15, ['*'], 'rejected_page')
                ->withQueryString()
                ->through(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'university' => $user->university ? [
                            'id' => $user->university->id,
                            'name' => $user->university->name,
                            'short_name' => $user->university->short_name,
                        ] : null,
                        'rejection_reason' => $user->rejection_reason,
                        'rejected_by' => $user->approver?->name,
                        'rejected_at' => $user->approved_at?->format('Y-m-d H:i:s'),
                        'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    ];
                });
        }

        // Query pending LPPM registrations (role_id is null and approval_status is pending)
        $pendingLppmQuery = User::query()
            ->whereNull('role_id')
            ->where('approval_status', 'pending')
            ->with(['university']);

        // Search filter for pending LPPM
        if ($request->filled('pending_lppm_search')) {
            $search = $request->pending_lppm_search;
            $pendingLppmQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Paginate pending LPPM separately with different query string
        $pendingLppm = $pendingLppmQuery
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'lppm_page')
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'university' => $user->university ? [
                        'id' => $user->university->id,
                        'name' => $user->university->name,
                        'short_name' => $user->university->short_name,
                    ] : null,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Query rejected LPPM registrations (optional view)
        $rejectedLppmQuery = User::query()
            ->whereNull('role_id')
            ->where('approval_status', 'rejected')
            ->with(['university', 'approver']);

        // Search filter for rejected LPPM
        if ($request->filled('rejected_lppm_search')) {
            $search = $request->rejected_lppm_search;
            $rejectedLppmQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Only show rejected if explicitly requested (toggle in UI)
        $rejectedLppm = null;
        if ($request->boolean('show_rejected')) {
            $rejectedLppm = $rejectedLppmQuery
                ->orderBy('approved_at', 'desc')
                ->paginate(15, ['*'], 'rejected_page')
                ->withQueryString()
                ->through(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'university' => $user->university ? [
                            'id' => $user->university->id,
                            'name' => $user->university->name,
                            'short_name' => $user->university->short_name,
                        ] : null,
                        'rejection_reason' => $user->rejection_reason,
                        'rejected_by' => $user->approver?->name,
                        'rejected_at' => $user->approved_at?->format('Y-m-d H:i:s'),
                        'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    ];
                });
        }

        return Inertia::render('Admin/AdminKampus/Index', [
            'adminKampus' => $adminKampus,
            'pendingLppm' => $pendingLppm,
            'rejectedLppm' => $rejectedLppm,
            'universities' => $universities,
            'filters' => array_merge(
                $request->only(['search', 'university_id', 'is_active', 'show_rejected']),
                [
                    'pending_lppm_search' => $request->pending_lppm_search,
                    'rejected_lppm_search' => $request->rejected_lppm_search,
                ]
            ),
        ]);
    }

    /**
     * Show the form for creating a new Admin Kampus.
     */
    public function create(Request $request): Response
    {
        $this->authorize('manage-admin-kampus');

        // Get all active universities
        $universities = University::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/AdminKampus/Create', [
            'universities' => $universities,
        ]);
    }

    /**
     * Store a newly created Admin Kampus in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('manage-admin-kampus');

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',
            'is_active' => 'required|boolean',
        ]);

        // Get Admin Kampus role
        $adminKampusRole = Role::where('name', 'Admin Kampus')->firstOrFail();

        // Create new Admin Kampus user
        $adminKampus = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $validated['university_id'],
            'role_id' => $adminKampusRole->id,
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->route('admin.admin-kampus.index')
            ->with('success', 'Admin Kampus created successfully.');
    }

    /**
     * Display the specified Admin Kampus.
     */
    public function show(Request $request, User $adminKampu): Response
    {
        $this->authorize('manage-admin-kampus');

        // Verify it's an Admin Kampus
        if (! $adminKampu->isAdminKampus()) {
            abort(404, 'Admin Kampus not found.');
        }

        // Load relationships
        $adminKampu->load(['role', 'university', 'journals.scientificField']);

        // Get managed users count
        $managedUsersCount = User::where('university_id', $adminKampu->university_id)
            ->whereHas('role', fn ($q) => $q->where('name', 'user'))
            ->count();

        return Inertia::render('Admin/AdminKampus/Show', [
            'adminKampus' => [
                'id' => $adminKampu->id,
                'name' => $adminKampu->name,
                'email' => $adminKampu->email,
                'phone' => $adminKampu->phone,
                'position' => $adminKampu->position,
                'avatar_url' => $adminKampu->avatar_url,
                'is_active' => $adminKampu->is_active,
                'university' => $adminKampu->university ? [
                    'id' => $adminKampu->university->id,
                    'name' => $adminKampu->university->name,
                    'short_name' => $adminKampu->university->short_name,
                    'code' => $adminKampu->university->code,
                    'city' => $adminKampu->university->city,
                    'province' => $adminKampu->university->province,
                ] : null,
                'last_login_at' => $adminKampu->last_login_at?->format('Y-m-d H:i'),
                'created_at' => $adminKampu->created_at->format('Y-m-d H:i'),
                'updated_at' => $adminKampu->updated_at->format('Y-m-d H:i'),
                'journals_count' => $adminKampu->journals->count(),
                'managed_users_count' => $managedUsersCount,
            ],
            'journals' => $adminKampu->journals->map(fn ($journal) => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'scientific_field' => $journal->scientificField?->name,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified Admin Kampus.
     */
    public function edit(Request $request, User $adminKampu): Response
    {
        $this->authorize('manage-admin-kampus');

        // Verify it's an Admin Kampus
        if (! $adminKampu->isAdminKampus()) {
            abort(404, 'Admin Kampus not found.');
        }

        $adminKampu->load('university');

        // Get all active universities
        $universities = University::active()
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/AdminKampus/Edit', [
            'adminKampus' => [
                'id' => $adminKampu->id,
                'name' => $adminKampu->name,
                'email' => $adminKampu->email,
                'phone' => $adminKampu->phone,
                'position' => $adminKampu->position,
                'university_id' => $adminKampu->university_id,
                'is_active' => $adminKampu->is_active,
            ],
            'universities' => $universities,
        ]);
    }

    /**
     * Update the specified Admin Kampus in storage.
     */
    public function update(Request $request, User $adminKampu)
    {
        $this->authorize('manage-admin-kampus');

        // Verify it's an Admin Kampus
        if (! $adminKampu->isAdminKampus()) {
            abort(404, 'Admin Kampus not found.');
        }

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$adminKampu->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',
            'is_active' => 'boolean',
        ]);

        // Update Admin Kampus
        $adminKampu->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $validated['university_id'],
            'is_active' => $validated['is_active'] ?? $adminKampu->is_active,
        ]);

        // Update password if provided
        if (! empty($validated['password'])) {
            $adminKampu->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        return redirect()->route('admin.admin-kampus.index')
            ->with('success', 'Admin Kampus updated successfully.');
    }

    /**
     * Remove the specified Admin Kampus from storage.
     */
    public function destroy(Request $request, User $adminKampu)
    {
        $this->authorize('manage-admin-kampus');

        // Load role relationship
        $adminKampu->load('role');

        // Verify it's an Admin Kampus
        if (! $adminKampu->isAdminKampus()) {
            abort(404, 'Admin Kampus not found.');
        }

        // Check if Admin Kampus has managed journals
        if ($adminKampu->journals()->count() > 0) {
            return back()->with('error', 'Cannot delete Admin Kampus with existing managed journals. Please reassign journals first.');
        }

        // Check if Admin Kampus has managed users
        $managedUsersCount = User::where('university_id', $adminKampu->university_id)
            ->whereHas('role', fn ($q) => $q->where('name', 'user'))
            ->count();

        if ($managedUsersCount > 0) {
            return back()->with('error', 'Cannot delete Admin Kampus with existing managed users. Please reassign or delete users first.');
        }

        // Soft delete Admin Kampus
        $adminKampu->delete();

        return redirect()->route('admin.admin-kampus.index')
            ->with('success', 'Admin Kampus deleted successfully.');
    }

    /**
     * Toggle active status of the Admin Kampus.
     */
    public function toggleActive(Request $request, User $admin_kampus)
    {
        $this->authorize('manage-admin-kampus');

        // Load role relationship
        $admin_kampus->load('role');

        // Verify it's an Admin Kampus
        if (! $admin_kampus->isAdminKampus()) {
            abort(404, 'Admin Kampus not found.');
        }

        // Toggle active status
        $admin_kampus->update([
            'is_active' => ! $admin_kampus->is_active,
        ]);

        $status = $admin_kampus->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Admin Kampus {$status} successfully.");
    }
}
