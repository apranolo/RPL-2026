<?php

namespace App\Http\Controllers;

use App\Models\ResearchSchema;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * SchemaController
 *
 * Manages CRUD operations for Research Schema (Skema Penelitian).
 *
 * @route /admin/schema/*
 */
class SchemaController extends Controller
{
    /**
     * Display a listing of research schemas.
     *
     * @route GET /admin/schema
     */
    public function index(Request $request): Response
    {
        $query = ResearchSchema::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $schemas = $query
            ->withCount('proposals')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($schema) => [
                'id'              => $schema->id,
                'name'            => $schema->name,
                'description'     => $schema->description,
                'proposals_count' => $schema->proposals_count,
                'created_at'      => $schema->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Schema/Index', [
            'schemas' => $schemas,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new research schema.
     *
     * @route GET /admin/schema/create
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Schema/Create');
    }

    /**
     * Store a newly created research schema in storage.
     *
     * @route POST /admin/schema
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:research_schemas,name',
            'description' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Nama skema wajib diisi.',
            'name.unique'   => 'Nama skema sudah digunakan, silakan gunakan nama lain.',
            'name.max'      => 'Nama skema maksimal 255 karakter.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
        ]);

        $schema = ResearchSchema::create($validated);

        return redirect()
            ->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$schema->name}' berhasil ditambahkan.");
    }

    /**
     * Show the form for editing the specified research schema.
     *
     * @route GET /admin/schema/{schema}/edit
     */
    public function edit(ResearchSchema $schema): Response
    {
        return Inertia::render('Admin/Schema/Edit', [
            'schema' => [
                'id'          => $schema->id,
                'name'        => $schema->name,
                'description' => $schema->description,
            ],
        ]);
    }

    /**
     * Update the specified research schema in storage.
     *
     * @route PUT/PATCH /admin/schema/{schema}
     */
    public function update(Request $request, ResearchSchema $schema): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:research_schemas,name,' . $schema->id,
            'description' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Nama skema wajib diisi.',
            'name.unique'   => 'Nama skema sudah digunakan, silakan gunakan nama lain.',
            'name.max'      => 'Nama skema maksimal 255 karakter.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
        ]);

        $schema->update($validated);

        return redirect()
            ->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$schema->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified research schema from storage.
     *
     * @route DELETE /admin/schema/{schema}
     */
    public function destroy(ResearchSchema $schema): RedirectResponse
    {
        // Prevent deletion if schema has associated proposals
        if ($schema->proposals()->count() > 0) {
            return back()->with('error', "Skema '{$schema->name}' tidak dapat dihapus karena masih memiliki proposal terkait.");
        }

        $schemaName = $schema->name;
        $schema->delete();

        return redirect()
            ->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$schemaName}' berhasil dihapus.");
    }
}
