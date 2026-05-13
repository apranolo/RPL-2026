<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccreditationTemplate;
use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembinaanController extends Controller
{
    /**
     * Display a listing of pembinaan programs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Pembinaan::class);

        $query = Pembinaan::with(['accreditationTemplate', 'creator'])
            ->withCount(['registrations', 'pendingRegistrations', 'approvedRegistrations']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $pembinaan = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pembinaan/Index', [
            'pembinaan' => $pembinaan,
            'filters' => [
                'status' => $request->status,
                'category' => $request->category,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new pembinaan program.
     */
    public function create(): Response
    {
        $this->authorize('create', Pembinaan::class);

        // Get active templates for selection
        $templates = AccreditationTemplate::active()
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        return Inertia::render('Admin/Pembinaan/Create', [
            'templates' => $templates,
        ]);
    }

    /**
     * Store a newly created pembinaan program.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Pembinaan::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:akreditasi,indeksasi',
            'accreditation_template_id' => 'nullable|exists:accreditation_templates,id',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after:registration_start',
            'assessment_start' => 'required|date|after_or_equal:registration_start',
            'assessment_end' => 'required|date|after:assessment_start',
            'quota' => 'nullable|integer|min:1',
        ]);

        $validated['status'] = 'draft'; // New programs start as draft
        $validated['created_by'] = $request->user()->id;

        Pembinaan::create($validated);

        return redirect()
            ->route('admin.pembinaan.index')
            ->with('success', 'Pembinaan program created successfully.');
    }

    /**
     * Display the specified pembinaan program with registrations.
     */
    public function show(Request $request, Pembinaan $pembinaan): Response
    {
        $this->authorize('view', $pembinaan);

        $pembinaan->load([
            'accreditationTemplate',
            'creator',
        ]);

        // Get registrations with filters
        $query = PembinaanRegistration::where('pembinaan_id', $pembinaan->id)
            ->with(['journal.university', 'journal.user', 'user', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('issn', 'like', "%{$request->search}%");
            });
        }

        $registrations = $query->orderBy('registered_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pembinaan/Show', [
            'pembinaan' => $pembinaan,
            'registrations' => $registrations,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for editing the pembinaan program.
     */
    public function edit(Pembinaan $pembinaan): Response
    {
        $this->authorize('update', $pembinaan);

        $pembinaan->load('accreditationTemplate');

        $templates = AccreditationTemplate::active()
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        return Inertia::render('Admin/Pembinaan/Edit', [
            'pembinaan' => $pembinaan,
            'templates' => $templates,
        ]);
    }

    /**
     * Update the specified pembinaan program.
     */
    public function update(Request $request, Pembinaan $pembinaan): RedirectResponse
    {
        $this->authorize('update', $pembinaan);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:akreditasi,indeksasi',
            'accreditation_template_id' => 'nullable|exists:accreditation_templates,id',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after:registration_start',
            'assessment_start' => 'required|date|after_or_equal:registration_start',
            'assessment_end' => 'required|date|after:assessment_start',
            'quota' => 'nullable|integer|min:1',
        ]);

        $validated['updated_by'] = $request->user()->id;

        $pembinaan->update($validated);

        return redirect()
            ->route('admin.pembinaan.show', $pembinaan)
            ->with('success', 'Pembinaan program updated successfully.');
    }

    /**
     * Remove the specified pembinaan program.
     */
    public function destroy(Pembinaan $pembinaan): RedirectResponse
    {
        $this->authorize('delete', $pembinaan);

        if (! $pembinaan->canBeDeleted()) {
            return back()->with('error', 'Cannot delete pembinaan with approved registrations.');
        }

        $pembinaan->delete();

        return redirect()
            ->route('admin.pembinaan.index')
            ->with('success', 'Pembinaan program deleted successfully.');
    }

    /**
     * Toggle pembinaan status (draft -> active -> closed).
     */
    public function toggleStatus(Request $request, Pembinaan $pembinaan): RedirectResponse
    {
        $this->authorize('toggleStatus', $pembinaan);

        $validated = $request->validate([
            'status' => 'required|in:draft,active,closed',
        ]);

        $pembinaan->update([
            'status' => $validated['status'],
            'updated_by' => $request->user()->id,
        ]);

        return back()->with('success', "Pembinaan status changed to {$validated['status']}.");
    }
}
