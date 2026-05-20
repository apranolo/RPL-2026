<?php

namespace App\Http\Controllers;

use App\Models\Schema;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchemaController extends Controller
{
    /**
     * Display a listing of the Schema.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request): Response
    {
        $query = Schema::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
        }

        $schemas = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Schema/Index', [
            'schemas' => $schemas,
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Display the specified Schema.
     *
     * @param  \App\Models\Schema  $schema
     * @return \Inertia\Response
     */
    public function show(Schema $schema): Response
    {
        $schema->load(['proposals.user.university']);

        return Inertia::render('Admin/Schema/Show', [
            'schema' => $schema,
        ]);
    }

    /**
     * Store a newly created Schema.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Schema::create($validated);

        return redirect()->back()->with('success', 'Skema Penelitian berhasil ditambahkan.');
    }

    /**
     * Update the specified Schema.
     */
    public function update(Request $request, Schema $schema)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $schema->update($validated);

        return redirect()->back()->with('success', 'Skema Penelitian berhasil diperbarui.');
    }

    /**
     * Remove the specified Schema.
     */
    public function destroy(Schema $schema)
    {
        // Check if there are proposals using this schema
        if ($schema->proposals()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus skema yang sedang digunakan oleh proposal.');
        }

        $schema->delete();

        return redirect()->back()->with('success', 'Skema Penelitian berhasil dihapus.');
    }
}