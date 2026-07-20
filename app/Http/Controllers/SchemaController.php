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

     * Display a listing of the Schema.

     *

     * @param  \Illuminate\Http\Request  $request

     * @return \Inertia\Response

     */

    public function index(Request $request): Response

    {

        $this->authorize('viewAny', ResearchSchema::class);



        $query = ResearchSchema::query();



        if ($request->filled('search')) {

            $query->where('name', 'like', "%{$request->search}%")

                  ->orWhere('description', 'like', "%{$request->search}%");

        }



        $schemas = $query->orderBy('created_at', 'desc')->get();



        return Inertia::render('Admin/Schema/Index', [

            'schemas' => SchemaResource::collection($schemas),

            'filters' => [

                'search' => $request->search ?? '',

            ],

        ]);

    }



    /**

     * Display the specified Schema.

     *

     * @param  \App\Models\ResearchSchema  $schema

     * @return \Inertia\Response

     */

    public function show(ResearchSchema $schema): Response

    {

        $this->authorize('view', $schema);



        $schema->load(['proposals.user.university']);



        return Inertia::render('Admin/Schema/Show', [

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

            'name' => 'required|string|max:255',

            'description' => 'nullable|string',

        ]);



        ResearchSchema::create($validated);



        return redirect()->back()->with('success', 'Skema Penelitian berhasil ditambahkan.');

    }



    /**

     * Update the specified Schema.

     */

    public function update(Request $request, ResearchSchema $schema)

    {

        $this->authorize('update', $schema);



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

    public function destroy(ResearchSchema $schema)

    {

        $this->authorize('delete', $schema);



        // Check if there are proposals using this schema

        if ($schema->proposals()->exists()) {

            return redirect()->back()->with('error', 'Tidak dapat menghapus skema yang sedang digunakan oleh proposal.');

        }



        $schema->delete();



        return redirect()->back()->with('success', 'Skema Penelitian berhasil dihapus.');

    }

}