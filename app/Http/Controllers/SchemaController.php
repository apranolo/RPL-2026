<?php

namespace App\Http\Controllers;

use App\Http\Resources\SchemaResource;
use App\Models\ResearchSchema;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchemaController extends Controller
{
    /**
     * Display a listing of the Schema (Tabel Skema Penelitian).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ResearchSchema::class);

        $query = ResearchSchema::withCount('proposals');

        // Filter pencarian berdasarkan nama atau deskripsi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status aktif
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting (default: terbaru)
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['name', 'created_at', 'max_funding', 'is_active', 'proposals_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $schemas = $query->paginate($request->input('per_page', 10))->withQueryString();

        return Inertia::render('Admin/Schema/Index', [
            'schemas' => SchemaResource::collection($schemas),
            'filters' => [
                'search' => $request->search ?? '',
                'is_active' => $request->is_active ?? '',
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Show the form for creating a new Schema.
     */
    public function create(): Response
    {
        $this->authorize('create', ResearchSchema::class);

        return Inertia::render('Admin/Schema/Create');
    }

    /**
     * Display the specified Schema.
     */
    public function show(Request $request, ResearchSchema $schema): Response
    {
        $this->authorize('view', $schema);

        $schema->loadCount('proposals');

        $proposalsQuery = $schema->proposals()->with(['user.university']);

        if ($request->filled('search')) {
            $search = $request->search;
            $proposalsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $proposalsQuery->where('status_proposal', $request->status);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['title', 'status_proposal', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $proposalsQuery->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $proposals = $proposalsQuery->paginate($request->input('per_page', 10))->withQueryString();

        return Inertia::render('Admin/Schema/Show', [
            'schema' => new SchemaResource($schema),
            'proposals' => $proposals,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified Schema.
     */
    public function edit(ResearchSchema $schema): Response
    {
        $this->authorize('update', $schema);

        return Inertia::render('Admin/Schema/Edit', [
            'schema' => new SchemaResource($schema),
        ]);
    }

    /**
     * Store a newly created Schema.
     */
    public function store(Request $request)
    {

        $this->authorize('create', ResearchSchema::class);

        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:research_schemas,name',

            'description' => 'nullable|string|max:1000',

        ]);

        ResearchSchema::create($validated);

        return redirect()->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$validated['name']}' berhasil ditambahkan.");

    }

    /**
     * Update the specified Schema.
     */
    public function update(Request $request, ResearchSchema $schema)
    {

        $this->authorize('update', $schema);

        $validated = $request->validate([

            'name' => 'required|string|max:255|unique:research_schemas,name,'.$schema->id,

            'description' => 'nullable|string|max:1000',

        ]);

        $schema->update($validated);

        return redirect()->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$validated['name']}' berhasil diperbarui.");

    }

    /**
     * Remove the specified Schema.
     */
    public function destroy(ResearchSchema $schema)
    {

        $this->authorize('delete', $schema);

        // Check if there are proposals using this schema
        if ($schema->proposals()->exists()) {
            abort(403, 'Tidak dapat menghapus skema yang sedang digunakan oleh proposal.');
        }

        $name = $schema->name;
        $schema->delete();

        return redirect()->route('admin.schema.index')
            ->with('success', "Skema Penelitian '{$name}' berhasil dihapus.");

    }
}
