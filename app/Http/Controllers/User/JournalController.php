<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Jobs\HarvestJournalArticlesJob;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Services\JournalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JournalController extends Controller
{
    protected JournalService $journalService;

    public function __construct(JournalService $journalService)
    {
        $this->journalService = $journalService;
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
        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

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
            return back()->with('error', 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus untuk mendaftarkan akun Anda ke universitas.');
        }

        $validated = $request->validated();

        try {
            $this->journalService->createJournal(
                $validated,
                $request->file('cover_image'),
                $user
            );

            return redirect()->route('user.journals.index')->with('success', 'Jurnal berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan jurnal. Silakan coba lagi nanti.');
        }
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
        ]);

        // OAI-PMH: fetch last harvest log
        $lastHarvestLog = DB::table('oai_harvesting_logs')
            ->where('journal_id', $journal->id)
            ->orderByDesc('harvested_at')
            ->first();

        // OAI-PMH: check for pending queue job
        $queueConfig = config('queue.connections.database', []);
        $jobsTable = $queueConfig['table'] ?? 'jobs';
        $queueConnection = $queueConfig['connection'] ?? null;

        $jobsQuery = $queueConnection
            ? DB::connection($queueConnection)->table($jobsTable)
            : DB::table($jobsTable);

        $isHarvestPending = $jobsQuery
            ->where('queue', 'harvesting')
            ->exists();

        $articlesCount = $journal->articles()->count();
        $articles = $journal->articles()
            ->orderBy('publication_date', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title,
                'authors' => $article->authors,
                'publication_date' => $article->publication_date?->format('Y-m-d'),
                'abstract' => $article->abstract,
                'doi' => $article->doi,
                'url' => $article->article_url,
            ]);

        return Inertia::render('User/Journals/Show', [
            'journal' => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'e_issn' => $journal->e_issn,
                'url' => $journal->url,
                'publisher' => $journal->publisher,
                'frequency' => $journal->frequency,
                'frequency_label' => $journal->frequency_label,
                'first_published_year' => $journal->first_published_year,
                'editor_in_chief' => $journal->editor_in_chief,
                'email' => $journal->email,
                'phone' => $journal->phone,
                'about' => $journal->about,
                'scope' => $journal->scope,

                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,

                // Accreditation
                'accreditation_start_year' => $journal->accreditation_start_year,
                'accreditation_end_year' => $journal->accreditation_end_year,
                'accreditation_sk_number' => $journal->accreditation_sk_number,
                'accreditation_sk_date' => $journal->accreditation_sk_date?->format('Y-m-d'),

                // Indexations
                'indexations' => $journal->indexations,

                // OAI-PMH - IMPORTANT: Must be included explicitly
                'oai_urls' => $journal->oai_urls,

                // Cover image
                'cover_image' => $journal->cover_image,
                'cover_image_url' => $journal->cover_image_url,

                // Status
                'is_active' => $journal->is_active,
                'approval_status' => $journal->approval_status,
                'approval_status_label' => $journal->approval_status_label,
                'rejection_reason' => $journal->rejection_reason,
                'approved_at' => $journal->approved_at,

                // Timestamps
                'created_at' => $journal->created_at->format('Y-m-d H:i'),
                'updated_at' => $journal->updated_at->format('Y-m-d H:i'),

                // Relationships
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'assessments' => $journal->assessments->map(fn ($assessment) => [
                    'id' => $assessment->id,
                    'assessment_date' => $assessment->assessment_date,
                    'period' => $assessment->period,
                    'status' => $assessment->status,
                    'status_label' => $assessment->status_label,
                    'total_score' => $assessment->total_score,
                    'max_score' => $assessment->max_score,
                    'percentage' => $assessment->percentage,
                    'grade' => $assessment->grade,
                    'submitted_at' => $assessment->submitted_at?->format('Y-m-d H:i'),
                ])->values(),
            ],
            'articles' => $articles,
            'statistics' => [
                'total_assessments' => $journal->assessments()->count(),
                'latest_score' => $journal->assessments()->latest()->first()?->total_score,
                'total_articles' => $articlesCount,
            ],
            'lastHarvestLog' => $lastHarvestLog,
            'isHarvestPending' => $isHarvestPending,
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

        try {
            $this->journalService->updateJournal(
                $validated,
                $request->file('cover_image'),
                $journal,
                Auth::user()
            );

            return redirect()->route('user.journals.index')->with('success', 'Data jurnal berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat memperbarui jurnal. Silakan coba lagi.');
        }
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

        $this->journalService->updateCover($request->file('cover_image'), $journal);

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

    /**
     * @route POST /user/journals/{journal}/harvest
     *
     * @features Dispatch background job to harvest articles from OAI-PMH endpoint for self-managed journals.
     */
    public function harvest(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        if (empty($journal->oai_urls)) {
            return redirect()
                ->route('user.journals.show', $journal)
                ->with('error', 'Jurnal ini belum memiliki OAI-PMH URL. Tambahkan URL-nya terlebih dahulu.');
        }

        $clearExisting = (bool) $request->input('force', false);
        HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');

        $message = $clearExisting
            ? 'Permintaan force sync OAI telah dikirim. Jika tidak ada proses sinkronisasi lain yang sudah dijadwalkan, semua artikel lama akan dihapus dan diimport ulang ketika proses berjalan.'
            : 'Permintaan sinkronisasi OAI telah dikirim. Proses berjalan di background dan dapat digabung dengan sinkronisasi yang sudah dijadwalkan.';

        return redirect()
            ->back()
            ->with('success', $message);
    }
}
