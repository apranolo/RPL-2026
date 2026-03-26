<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportJournalRequest;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Imports\JournalsImport;
use App\Jobs\HarvestJournalArticlesJob;
use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\User;
use App\Services\JournalCoverService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * JournalController - Admin Kampus
 *
 * Manages journal viewing operations for Admin Kampus role.
 * Admin Kampus can only view journals from their own university.
 */
class JournalController extends Controller
{
    protected JournalCoverService $coverService;

    public function __construct(JournalCoverService $coverService)
    {
        $this->coverService = $coverService;
    }

    /**
     * Display a listing of journals for the Admin Kampus's university.
     *
     * @route GET /admin-kampus/journals
     *
     * @features List journals, search, filter by status/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Journal::class);

        $authUser = $request->user();

        // Guard: Admin Kampus must have a university assigned
        abort_if(
            is_null($authUser->university_id),
            403,
            'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
        );

        // Base query - scoped to Admin Kampus's university
        $query = Journal::query()
            ->with(['university', 'user', 'scientificField', 'latestAssessment'])
            ->forUniversity($authUser->university_id);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // // Deprecated: Status filter is no longer used
        // if ($request->filled('status')) {
        //     $query->byAssessmentStatus($request->status);
        // }

        // Apply SINTA rank filter
        if ($request->filled('sinta_rank')) {
            $query->bySintaRank($request->sinta_rank);
        }

        // Apply scientific field filter
        if ($request->filled('scientific_field_id')) {
            $query->where('scientific_field_id', $request->scientific_field_id);
        }

        // Apply indexation filter
        if ($request->filled('indexation')) {
            $query->byIndexation($request->indexation);
        }

        // // Deprecated: Accreditation Dikti filter is no longer used
        // if ($request->filled('accreditation_grade')) {
        //     $query->byAccreditationGrade($request->accreditation_grade);
        // }

        // Apply pembinaan period filter (Phase 2)
        if ($request->filled('pembinaan_period')) {
            $query->byPembinaanPeriod($request->pembinaan_period);
        }

        // Apply pembinaan year filter (Phase 2)
        if ($request->filled('pembinaan_year')) {
            $query->byPembinaanYear($request->pembinaan_year);
        }

        // Apply participation filter (Phase 2)
        if ($request->filled('participation')) {
            $query->byParticipation($request->participation);
        }

        // Apply approval status filter (Phase 2)
        if ($request->filled('approval_status')) {
            $query->byApprovalStatus($request->approval_status);
        }

        // Calculate statistics for dashboard (before pagination)
        $statistics = $this->calculateJournalStatistics($authUser->university_id);

        // Paginate results
        $journals = $query
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($journal) => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'e_issn' => $journal->e_issn,
                'url' => $journal->url,
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                ],
                'user' => [
                    'id' => $journal->user->id,
                    'name' => $journal->user->name,
                    'email' => $journal->user->email,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
                'is_active' => $journal->is_active,
                'approval_status' => $journal->approval_status,
                'indexation_labels' => $journal->indexation_labels,
                'created_at' => $journal->created_at->format('Y-m-d'),
            ]);

        // Get filter options
        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sintaRanks = collect(Journal::getSintaRankOptions())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        // Deprecated: Status filter is no longer used in Admin Kampus Journals
        // $statusOptions = collect([
        //     ['value' => 'draft', 'label' => 'Draft'],
        //     ['value' => 'submitted', 'label' => 'Submitted'],
        //     ['value' => 'reviewed', 'label' => 'Reviewed'],
        // ]);

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        // Deprecated: Dikti Accreditation Grade filter is no longer used in Admin Kampus Journals
        // $accreditationGradeOptions = collect(Journal::getAccreditationGrades())
        //     ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
        //     ->values();

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        // Phase 2: Get pembinaan periods and years for filters
        $pembinaanPeriods = \App\Models\Pembinaan::query()
            ->select('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name')
            ->map(fn ($name) => ['value' => $name, 'label' => $name])
            ->values();

        $pembinaanYears = \App\Models\PembinaanRegistration::query()
            ->selectRaw('YEAR(registered_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn ($year) => ['value' => (string) $year, 'label' => (string) $year])
            ->values();

        $participationOptions = collect([
            ['value' => 'sudah_ikut', 'label' => 'Sudah Ikut Pembinaan'],
            ['value' => 'belum_ikut', 'label' => 'Belum Ikut Pembinaan'],
        ]);

        $approvalStatusOptions = collect([
            ['value' => 'approved', 'label' => 'Sudah Di-Approve'],
            ['value' => 'pending', 'label' => 'Menunggu Approval'],
            ['value' => 'rejected', 'label' => 'Ditolak'],
        ]);

        // Get users from same university for reassignment
        $universityUsers = User::where('university_id', auth()->user()->university_id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminKampus/Journals/Index', [
            'journals' => $journals,
            'statistics' => $statistics,
            'filters' => $request->only([
                'search',
                'sinta_rank',
                'scientific_field_id',
                'indexation',
                'pembinaan_period',
                'pembinaan_year',
                'participation',
                'approval_status',
            ]),
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'indexationOptions' => $indexationOptions,
            'pembinaanPeriods' => $pembinaanPeriods,
            'pembinaanYears' => $pembinaanYears,
            'participationOptions' => $participationOptions,
            'approvalStatusOptions' => $approvalStatusOptions,
            'universityUsers' => $universityUsers,
        ]);
    }

    /**
     * Calculate journal statistics for the dashboard.
     *
     * Aggregates data by indexation platforms, SINTA ranks, and scientific fields.
     */
    private function calculateJournalStatistics(int $universityId): array
    {
        // Get all journals for this university
        $journals = Journal::where('university_id', $universityId)
            ->with('scientificField')
            ->get();

        $totalJournals = $journals->count();

        // Calculate totals
        // Note: "Indexed journals" means Scopus-indexed only (as per meeting notes 02 Feb 2026)
        $indexedJournals = $journals->filter(fn ($j) => isset($j->indexations['Scopus']))->count();
        $sintaJournals = $journals->filter(fn ($j) => $j->sinta_rank !== null)->count();
        $nonSintaJournals = $totalJournals - $sintaJournals;

        // Aggregate by indexation
        $indexationCounts = [];
        foreach ($journals as $journal) {
            if ($journal->indexations && is_array($journal->indexations)) {
                foreach (array_keys($journal->indexations) as $platform) {
                    $indexationCounts[$platform] = ($indexationCounts[$platform] ?? 0) + 1;
                }
            }
        }

        $byIndexation = collect($indexationCounts)
            ->map(fn ($count, $name) => [
                'name' => $name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->values()
            ->toArray();

        // Aggregate by SINTA rank
        $sintaGroups = $journals->groupBy('sinta_rank');
        $byAccreditation = [];

        // Non-Sinta journals
        $byAccreditation[] = [
            'sinta_rank' => null,
            'label' => 'Non-Sinta',
            'count' => $nonSintaJournals,
            'percentage' => $totalJournals > 0 ? round(($nonSintaJournals / $totalJournals) * 100, 1) : 0,
        ];

        // SINTA 1-6
        for ($rank = 1; $rank <= 6; $rank++) {
            $count = $sintaGroups->get($rank)?->count() ?? 0;
            $byAccreditation[] = [
                'sinta_rank' => $rank,
                'label' => "SINTA {$rank}",
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        }

        // Aggregate by scientific field
        $fieldGroups = $journals->filter(fn ($j) => $j->scientificField !== null)
            ->groupBy('scientific_field_id');

        $byScientificField = $fieldGroups->map(function ($group) use ($totalJournals) {
            $field = $group->first()->scientificField;
            $count = $group->count();

            return [
                'id' => $field->id,
                'name' => $field->name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        })
            ->sortByDesc('count')
            ->values()
            ->toArray();

        return [
            'totals' => [
                'total_journals' => $totalJournals,
                'indexed_journals' => $indexedJournals,
                'sinta_journals' => $sintaJournals,
                'non_sinta_journals' => $nonSintaJournals,
            ],
            'by_indexation' => $byIndexation,
            'by_accreditation' => $byAccreditation,
            'by_scientific_field' => $byScientificField,
        ];
    }

    /**
     * Display the specified journal with its assessments.
     *
     * @route GET /admin-kampus/journals/{journal}
     *
     * @features View journal details, view all assessments (read-only)
     */
    public function show(Journal $journal): Response
    {
        $this->authorize('view', $journal);

        // Eager load relationships
        $journal->load([
            'university',
            'user',
            'scientificField',
            'assessments' => function ($query) {
                $query->with(['user'])
                    ->orderBy('assessment_date', 'desc');
            },
        ]);

        // OAI-PMH: fetch last harvest log
        $lastHarvestLog = DB::table('oai_harvesting_logs')
            ->where('journal_id', $journal->id)
            ->orderByDesc('harvested_at')
            ->first();

        // OAI-PMH: check for pending queue job (best-effort UI hint; ShouldBeUnique on the job
        // is the authoritative duplicate prevention mechanism).
        // PHP-serialized integer i:X; is how the journal ID appears in the payload command string.
        $isHarvestPending = DB::table('jobs')
            ->where('queue', 'harvesting')
            ->where('payload', 'like', '%HarvestJournalArticlesJob%')
            ->where('payload', 'like', '%i:'.$journal->id.';%')
            ->exists();

        $articlesCount = $journal->articles()->count();

        return Inertia::render('AdminKampus/Journals/Show', [
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

                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,

                // Accreditation (merged)
                'accreditation_label' => $journal->accreditation_label,
                'accreditation_start_year' => $journal->accreditation_start_year,
                'accreditation_end_year' => $journal->accreditation_end_year,
                'accreditation_sk_number' => $journal->accreditation_sk_number,
                'accreditation_sk_date' => $journal->accreditation_sk_date?->format('Y-m-d'),
                'accreditation_expiry_status' => $journal->accreditation_expiry_status,

                // Indexations
                'indexations' => $journal->indexations,
                'indexation_labels' => $journal->indexation_labels,

                // OAI-PMH
                'oai_pmh_url' => $journal->oai_pmh_url,

                // Cover image
                'cover_image' => $journal->cover_image,
                'cover_image_url' => $journal->cover_image_url,

                'is_active' => $journal->is_active,
                'created_at' => $journal->created_at->format('Y-m-d H:i'),
                'updated_at' => $journal->updated_at->format('Y-m-d H:i'),
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                    'code' => $journal->university->code,
                ],
                'user' => [
                    'id' => $journal->user->id,
                    'name' => $journal->user->name,
                    'email' => $journal->user->email,
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
                    'status_color' => $assessment->status_color,
                    'total_score' => $assessment->total_score,
                    'max_score' => $assessment->max_score,
                    'percentage' => $assessment->percentage,
                    'grade' => $assessment->grade,
                    'submitted_at' => $assessment->submitted_at?->format('Y-m-d H:i'),
                    'reviewed_at' => $assessment->reviewed_at?->format('Y-m-d H:i'),
                    'user' => [
                        'id' => $assessment->user->id,
                        'name' => $assessment->user->name,
                    ],
                ]),
            ],
            'articlesCount' => $articlesCount,
            'lastHarvestLog' => $lastHarvestLog ? (array) $lastHarvestLog : null,
            'isHarvestPending' => $isHarvestPending,
        ]);
    }

    /**
     * Dispatch OAI-PMH harvest job to the queue.
     *
     * @route POST /admin-kampus/journals/{journal}/harvest
     *
     * @features Dispatch background job to harvest articles from OAI-PMH endpoint.
     *           Accepts optional `force=1` request field which deletes all existing
     *           articles for this journal before harvesting (full re-import).
     */
    public function harvest(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        if (empty($journal->oai_pmh_url)) {
            return redirect()
                ->route('admin-kampus.journals.show', $journal)
                ->with('error', 'Jurnal ini belum memiliki OAI-PMH URL. Tambahkan URL-nya terlebih dahulu melalui form edit jurnal.');
        }

        $clearExisting = (bool) $request->input('force', false);

        // ShouldBeUnique on the job prevents duplicate dispatches silently.
        // clearExisting=true bypasses uniqueness so a forced re-import is always dispatched
        // even if a normal harvest is already queued.
        HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');

        $message = $clearExisting
            ? 'Force sync dijadwalkan. Semua artikel lama akan dihapus dan diimport ulang dari OAI-PMH — silakan refresh halaman beberapa saat kemudian.'
            : 'Harvest artikel dijadwalkan. Proses berjalan di background — silakan refresh halaman beberapa saat kemudian untuk melihat hasilnya.';

        return redirect()
            ->route('admin-kampus.journals.show', $journal)
            ->with('success', $message);
    }

    /**
     * @route POST /admin-kampus/journals/harvest/bulk
     *
     * @features Dispatch background job to harvest articles from OAI-PMH endpoint for multiple journals.
     */
    public function bulkHarvest(Request $request): RedirectResponse
    {
        $request->validate([
            'journal_ids' => ['required', 'array', 'min:1'],
            'journal_ids.*' => ['integer', 'exists:journals,id'],
        ]);

        $journals = Journal::whereIn('id', $request->input('journal_ids'))->get();
        $dispatchedCount = 0;
        $skippedCount = 0;

        foreach ($journals as $journal) {
            // Check policy manually vs university since it's an array
            if (Auth::user()->university_id !== $journal->university_id) {
                // Skip if unauthorized
                continue;
            }

            if (empty($journal->oai_pmh_url)) {
                $skippedCount++;

                continue;
            }

            $clearExisting = (bool) $request->input('force', false);
            HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');
            $dispatchedCount++;
        }

        $message = "Proses massal OAI-PMH sinkronisasi dijadwalkan untuk $dispatchedCount jurnal.";
        if ($skippedCount > 0) {
            $message .= " (Lewati $skippedCount jurnal tanpa URL OAI-PMH)";
        }

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * Show the form for creating a new journal.
     *
     * @route GET /admin-kampus/journals/create
     *
     * @features Journal creation form with user assignment
     */
    public function create(): Response
    {
        $this->authorize('create', Journal::class);

        $authUser = Auth::user();

        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get users from same university for owner assignment
        $universityUsers = User::query()
            ->where('role_id', DB::table('roles')->where('name', Role::USER)->value('id'))
            ->where('university_id', $authUser->university_id)
            ->where('is_active', true)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminKampus/Journals/Create', [
            'scientificFields' => $scientificFields,
            'sintaRankOptions' => Journal::getSintaRankOptions(),
            'indexationOptions' => $this->getIndexationOptions(),
            'universityUsers' => $universityUsers,
        ]);
    }

    /**
     * Store a newly created journal.
     *
     * @route POST /admin-kampus/journals
     *
     * @features Create journal with user assignment, scoped to admin's university
     */
    public function store(StoreJournalRequest $request): RedirectResponse
    {
        $this->authorize('create', Journal::class);

        $authUser = Auth::user();

        $validated = $request->validated();
        $validated['university_id'] = $authUser->university_id;

        // If user_id is provided, use it; otherwise default to the admin user
        if ($request->filled('user_id')) {
            // Verify user belongs to same university
            $targetUser = User::where('id', $request->user_id)
                ->where('university_id', $authUser->university_id)
                ->firstOrFail();
            $validated['user_id'] = $targetUser->id;
        } else {
            $validated['user_id'] = $authUser->id;
        }

        // Bug fix #4: Admin Kampus creates approved journals, not pending
        $validated['approval_status'] = 'approved';
        $validated['approved_by'] = $authUser->id;
        $validated['approved_at'] = now();

        // Bug fix #1: unset cover_image so UploadedFile object is not passed to Journal::create()
        // The file is handled separately after the record is created.
        unset($validated['cover_image']);

        $journal = Journal::create($validated);

        // Handle optional cover image upload
        if ($request->hasFile('cover_image')) {
            $journal->update(['cover_image' => $this->coverService->upload($request->file('cover_image'), $journal)]);
        }

        return redirect()->route('admin-kampus.journals.index')
            ->with('success', 'Jurnal berhasil ditambahkan.');
    }

    /**
     * Show the form for editing an existing journal.
     *
     * @route GET /admin-kampus/journals/{journal}/edit
     *
     * @features Edit journal form with pre-populated data
     */
    public function edit(Journal $journal): Response
    {
        $this->authorize('update', $journal);

        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminKampus/Journals/Edit', [
            'journal' => $journal,
            'scientificFields' => $scientificFields,
            'sintaRankOptions' => Journal::getSintaRankOptions(),
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Update the specified journal.
     *
     * @route PUT /admin-kampus/journals/{journal}
     *
     * @features Update journal data
     */
    public function update(UpdateJournalRequest $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        $validated = $request->validated();

        // Handle optional cover image upload (file replaces text path in validated)
        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->coverService->upload($request->file('cover_image'), $journal);
        } else {
            // Exclude cover_image from validated so existing value is preserved
            unset($validated['cover_image']);
        }

        $journal->update($validated);

        return redirect()->route('admin-kampus.journals.index')
            ->with('success', 'Data jurnal berhasil diperbarui.');
    }

    /**
     * Upload or replace the cover image for a journal (dedicated endpoint).
     *
     * @route PATCH /admin-kampus/journals/{journal}/cover
     *
     * @features Upload cover image; replaces existing cover; returns to journal show page
     */
    public function uploadCover(Request $request, Journal $journal): RedirectResponse
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

        return redirect()->route('admin-kampus.journals.show', $journal)
            ->with('success', 'Cover jurnal berhasil diperbarui.');
    }

    /**
     * Delete the specified journal.
     *
     * @route DELETE /admin-kampus/journals/{journal}
     *
     * @features Delete journal (only non-approved)
     */
    public function destroy(Journal $journal): RedirectResponse
    {
        $this->authorize('delete', $journal);

        $journal->delete();

        return redirect()->route('admin-kampus.journals.index')
            ->with('success', 'Jurnal berhasil dihapus.');
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
     * Show the import form with user selection.
     *
     * @route GET /admin-kampus/journals/import/form
     *
     * @features Display import form with user dropdown, CSV format guidelines
     */
    public function import(Request $request): Response
    {
        $this->authorize('create', Journal::class);

        $authUser = $request->user();

        // Get scientific fields for reference
        $scientificFields = ScientificField::query()
            ->where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminKampus/Journals/Import', [
            'scientificFields' => $scientificFields,
        ]);
    }

    /**
     * Process the CSV import and create journals.
     *
     * @route POST /admin-kampus/journals/import/process
     *
     * @features Upload CSV, validate data, batch create journals, error reporting
     */
    public function processImport(ImportJournalRequest $request): RedirectResponse
    {
        $this->authorize('create', Journal::class);

        $authUser = $request->user();

        try {
            DB::beginTransaction();

            // Get the uploaded file path
            $file = $request->file('csv_file');
            $filePath = $file->getRealPath();

            // Process the CSV import - auto-assign to current LPPM user
            $import = new JournalsImport($authUser->university_id, $authUser->id);
            $import->import($filePath);

            $summary = $import->getSummary();

            DB::commit();

            // If all rows have errors, return with error
            if ($summary['success_count'] === 0 && $summary['error_count'] > 0) {
                return redirect()->route('admin-kampus.journals.import')
                    ->with('error', 'Semua data gagal diimport. Silakan periksa format CSV Anda.')
                    ->with('import_errors', $summary['errors']);
            }

            // If partial success (some errors), redirect with warning
            if ($summary['error_count'] > 0) {
                return redirect()->route('admin-kampus.journals.index')
                    ->with('warning', "Import selesai dengan peringatan: {$summary['success_count']} jurnal berhasil diimport, {$summary['error_count']} baris gagal.")
                    ->with('import_errors', $summary['errors']);
            }

            // All successful
            return redirect()->route('admin-kampus.journals.index')
                ->with('success', "Berhasil mengimport {$summary['success_count']} jurnal dari CSV.");

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->route('admin-kampus.journals.import')
                ->with('error', 'Terjadi kesalahan saat memproses file CSV: '.$e->getMessage());
        }
    }

    /**
     * Download CSV template for journal import.
     *
     * @route GET /admin-kampus/journals/import/template
     *
     * @features Generate and download CSV template with headers and sample data
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="template_import_jurnal.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // Add BOM for UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Headers
            fputcsv($file, [
                'title',
                'publisher',
                'issn',
                'e_issn',
                'publication_year',
                'sinta_rank',
                'url',
                'oai_url',
                'email',
                'phone',
            ]);

            // Sample data row 1
            fputcsv($file, [
                'Jurnal Teknologi Informasi',
                'Universitas Example',
                '1234-5678',
                '9876-5432',
                '2020',
                '2',
                'https://example.com/journal',
                'https://ojs.example.com/index.php/jti/oai',
                'editor@example.com',
                '081234567890',
            ]);

            // Sample data row 2
            fputcsv($file, [
                'Jurnal Ekonomi dan Bisnis',
                'Universitas Example Press',
                '2345-6789',
                '8765-4321',
                '2019',
                '',
                'https://example.com/ekonomi',
                'https://ojs.example.com/index.php/jeb/oai',
                'ekonomi@example.com',
                '',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Reassign journal manager to another user.
     *
     * @route POST /admin-kampus/journals/{journal}/reassign
     *
     * @features Transfer journal ownership, audit log, notifications to both users
     */
    public function reassign(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('reassign', $journal);

        $request->validate([
            'new_user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ], [
            'new_user_id.required' => 'Manager baru harus dipilih.',
            'new_user_id.exists' => 'User tidak ditemukan.',
            'reason.max' => 'Alasan maksimal 500 karakter.',
        ]);

        // Ensure new user is from same university
        $newUser = User::findOrFail($request->new_user_id);
        if ($newUser->university_id !== auth()->user()->university_id) {
            return back()->withErrors(['error' => 'User baru harus dari universitas yang sama.']);
        }

        // Prevent reassigning to the same user
        if ($journal->user_id === $request->new_user_id) {
            return back()->withErrors(['error' => 'Jurnal sudah dikelola oleh user ini.']);
        }

        $oldUserId = $journal->user_id;
        $oldUser = $journal->user;

        // Log reassignment to audit table
        DB::table('journal_reassignments')->insert([
            'journal_id' => $journal->id,
            'from_user_id' => $oldUserId,
            'to_user_id' => $request->new_user_id,
            'reassigned_by' => auth()->id(),
            'reason' => $request->reason,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update journal ownership
        $journal->update([
            'user_id' => $request->new_user_id,
        ]);

        // TODO: Send JournalReassignedNotification to both users
        // $oldUser->notify(new JournalReassignedNotification($journal, 'removed'));
        // $newUser->notify(new JournalReassignedNotification($journal, 'assigned'));

        return back()->with('success', "Jurnal \"{$journal->name}\" berhasil di-reassign dari {$oldUser->name} ke {$newUser->name}.");
    }
}
