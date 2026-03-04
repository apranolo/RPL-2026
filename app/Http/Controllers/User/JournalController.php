<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Services\JournalCoverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JournalController extends Controller
{
    protected JournalCoverService $coverService;

    public function __construct(JournalCoverService $coverService)
    {
        $this->coverService = $coverService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Journal::class);
        $user = Auth::user();

        $query = Journal::where('user_id', $user->id)
            ->with(['scientificField', 'university']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%")
                    ->orWhere('e_issn', 'like', "%{$search}%");
            });
        }

        // Filter by SINTA rank
        if ($sintaRank = $request->input('sinta_rank')) {
            $query->where('sinta_rank', $sintaRank);
        }

        // Filter by scientific field
        if ($fieldId = $request->input('scientific_field_id')) {
            $query->where('scientific_field_id', $fieldId);
        }

        // Filter by approval status
        if ($status = $request->input('approval_status')) {
            $query->where('approval_status', $status);
        }

        $journals = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('User/Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'sinta_rank', 'scientific_field_id', 'approval_status']),
            'scientificFields' => ScientificField::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Journal::class);
        $scientificFields = ScientificField::select('id', 'name')->get();

        return Inertia::render('User/Journals/Create', [
            'scientificFields' => $scientificFields,
            'sintaRankOptions' => Journal::getSintaRankOptions(),
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJournalRequest $request)
    {
        $this->authorize('create', Journal::class);
        $user = Auth::user();

        // Ensure user has a university assigned
        if (! $user->university_id) {
            return back()->withErrors(['university_id' => 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus.']);
        }

        $validated = $request->validated();
        $validated['user_id'] = $user->id;
        $validated['university_id'] = $user->university_id;

        $journal = Journal::create($validated);

        // Handle optional cover image upload
        if ($request->hasFile('cover_image')) {
            $journal->update(['cover_image' => $this->coverService->upload($request->file('cover_image'), $journal)]);
        }

        return redirect()->route('user.journals.index')->with('success', 'Jurnal berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Journal $journal)
    {
        $this->authorize('view', $journal);

        $journal->load([
            'scientificField',
            'university',
            'assessments' => fn ($q) => $q->latest()->limit(10),
            'articles' => fn ($q) => $q->latest()->limit(10),
        ]);

        return Inertia::render('User/Journals/Show', [
            'journal' => $journal,
            'statistics' => [
                'total_assessments' => $journal->assessments()->count(),
                'latest_score' => $journal->assessments()->latest()->first()?->total_score,
                'total_articles' => $journal->articles()->count(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Journal $journal)
    {
        $this->authorize('update', $journal);

        $scientificFields = ScientificField::select('id', 'name')->get();

        return Inertia::render('User/Journals/Edit', [
            'journal' => $journal,
            'scientificFields' => $scientificFields,
            'sintaRankOptions' => Journal::getSintaRankOptions(),
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJournalRequest $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $validated = $request->validated();

        // Handle optional cover image upload
        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->coverService->upload($request->file('cover_image'), $journal);
        } else {
            unset($validated['cover_image']);
        }

        $journal->update($validated);

        return redirect()->route('user.journals.index')->with('success', 'Data jurnal berhasil diperbarui.');
    }

    /**
     * Upload or replace the cover image for a journal (dedicated endpoint).
     *
     * @route PATCH /user/journals/{journal}/cover
     *
     * @features Upload cover image; replaces existing cover; returns to journal show page
     */
    public function uploadCover(Request $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $request->validate([
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048|dimensions:min_width=300,min_height=400',
        ], [
            'cover_image.required' => 'Pilih file gambar untuk diupload.',
            'cover_image.image' => 'File cover harus berupa gambar.',
            'cover_image.mimes' => 'Format cover harus JPEG, PNG, JPG, atau WebP.',
            'cover_image.max' => 'Ukuran file cover maksimal 2MB.',
            'cover_image.dimensions' => 'Resolusi cover minimal 300x400 piksel.',
        ]);

        $journal->update(['cover_image' => $this->coverService->upload($request->file('cover_image'), $journal)]);

        return redirect()->route('user.journals.show', $journal)
            ->with('success', 'Cover jurnal berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Journal $journal)
    {
        $this->authorize('delete', $journal);

        $journal->delete();

        return redirect()->route('user.journals.index')->with('success', 'Jurnal berhasil dihapus.');
    }

    /**
     * Get available indexation platforms
     */
    private function getIndexationOptions(): array
    {
        return collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->toArray();
    }
}
