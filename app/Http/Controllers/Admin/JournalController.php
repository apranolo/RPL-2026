<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\HarvestJournalArticlesJob;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * JournalController - Super Admin
 *
 * Manages journal viewing operations for Super Admin role.
 * Super Admin can view all journals from all universities.
 */
class JournalController extends Controller
{
    /**
     * Display a listing of all journals in the system.
     *
     * @route GET /admin/journals
     *
     * @features List all journals, search, filter by PTM/status/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Journal::class);

        $authUser = $request->user();

        // Base query - Super Admin sees all journals
        $query = Journal::query()
            ->with(['university', 'user', 'scientificField']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply university filter (Super Admin only)
        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->byAssessmentStatus($request->status);
        }

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

        // Get filter options (with cache)
        $universities = Cache::remember('universities.active.list', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);
        });

        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sintaRanks = collect(Journal::getSintaRankOptions())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        $statusOptions = collect([
            ['value' => 'draft', 'label' => 'Draft'],
            ['value' => 'submitted', 'label' => 'Submitted'],
            ['value' => 'reviewed', 'label' => 'Reviewed'],
        ]);

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        return Inertia::render('Admin/Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'university_id', 'status', 'sinta_rank', 'scientific_field_id', 'indexation']),
            'universities' => $universities,
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'statusOptions' => $statusOptions,
            'indexationOptions' => $indexationOptions,
        ]);
    }

    /**
     * Display the specified journal with its assessments.
     *
     * @route GET /admin/journals/{journal}
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

        return Inertia::render('Admin/Journals/Show', [
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

                // SINTA
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
                'oai_urls' => $journal->oai_urls,

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
            'articles' => $articles,
            'articlesCount' => $articlesCount,
            'lastHarvestLog' => DB::table('oai_harvesting_logs')
                ->where('journal_id', $journal->id)
                ->orderByDesc('harvested_at')
                ->first(),
            'isHarvestPending' => DB::table('jobs')
                ->where('queue', 'harvesting')
                ->where('payload', 'like', '%"journal_id":'.$journal->id.'%')
                ->exists(),
        ]);
    }

    /**
     * @route POST /admin/journals/{journal}/harvest
     *
     * @features Dispatch background job to harvest articles from OAI-PMH endpoint.
     */
    public function harvest(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        if (empty($journal->oai_urls)) {
            return redirect()
                ->route('admin.journals.show', $journal)
                ->with('error', 'Jurnal ini belum memiliki OAI-PMH URL.');
        }

        $clearExisting = (bool) $request->input('force', false);
        HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');

        $message = $clearExisting
            ? 'Permintaan force sync OAI telah dikirim.'
            : 'Permintaan sinkronisasi OAI telah dikirim.';

        return redirect()
            ->back()
            ->with('success', $message);
    }
}
