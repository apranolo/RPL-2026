<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PublicJournalController
 *
 * Manages public journal viewing operations.
 * No authentication required.
 */
class PublicJournalController extends Controller
{
    /**
     * Display a publicly accessible listing of journals.
     *
     * @route GET /journals
     *
     * @features List all active journals, search, filter by university/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        // Base query - only show active journals
        $query = Journal::query()
            ->with(['university', 'scientificField'])
            ->where('is_active', true);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply university filter
        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
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
            ->orderBy('title')
            ->paginate(12)
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
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
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

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        return Inertia::render('Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'university_id', 'sinta_rank', 'scientific_field_id', 'indexation']),
            'universities' => $universities,
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'indexationOptions' => $indexationOptions,
        ]);
    }

    /**
     * Display the specified journal.
     *
     * @route GET /journals/{journal}
     *
     * @features View public journal details with article filtering and search
     */
    public function show(Request $request, Journal $journal): Response
    {
        // Only show active journals to public
        if (! $journal->is_active) {
            abort(404);
        }

        // Eager load relationships
        $journal->load([
            'university',
            'scientificField',
        ]);

        // Start building the articles query
        $articlesQuery = $journal->articles()
            ->orderBy('publication_date', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $articlesQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('abstract', 'like', "%{$search}%")
                    ->orWhere('authors', 'like', "%{$search}%");
            });
        }

        // Apply volume filter
        if ($request->filled('volume')) {
            $articlesQuery->where('volume', $request->volume);
        }

        // Apply issue filter
        if ($request->filled('issue')) {
            $articlesQuery->where('issue', $request->issue);
        }

        // Filter by Year
        if ($request->filled('year_start')) {
            $articlesQuery->whereYear('publication_date', '>=', $request->year_start);
        }
        if ($request->filled('year_end')) {
            $articlesQuery->whereYear('publication_date', '<=', $request->year_end);
        }

        // Get paginated articles
        $articles = $articlesQuery->paginate(10)
            ->withQueryString()
            ->through(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title,
                'abstract' => $article->abstract,
                'authors' => $article->authors,
                'authors_list' => $article->authors_list,
                'doi' => $article->doi,
                'doi_url' => $article->doi_url,
                'publication_date' => $article->publication_date,
                'volume' => $article->volume,
                'issue' => $article->issue,
                'volume_issue' => $article->volume_issue,
                'pages' => $article->pages,
                'article_url' => $article->article_url,
                'pdf_url' => $article->pdf_url,
                'google_scholar_url' => $article->google_scholar_url,
            ]);

        // Get issues list for sidebar
        $issuesList = $journal->articles()
            ->select('volume', 'issue')
            ->selectRaw('MAX(publication_date) as date')
            ->whereNotNull('volume')
            ->groupBy('volume', 'issue')
            ->orderBy('date', 'desc')
            ->orderBy('volume', 'desc')
            ->orderBy('issue', 'desc')
            ->get()
            ->map(fn ($item) => [
                'volume' => $item->volume,
                'issue' => $item->issue,
                'label' => $item->issue ? "Vol {$item->volume}, No {$item->issue}" : "Vol {$item->volume}",
                'year' => date('Y', strtotime($item->date)),
            ]);

        // Get article statistics by year
        $articlesCount = $journal->articles()->count();
        $articlesByYear = $journal->articles()
            ->selectRaw('YEAR(publication_date) as year, COUNT(*) as count')
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Journals/Show', [
            'journal' => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'e_issn' => $journal->e_issn,
                'url' => $journal->url,
                'oai_pmh_url' => $journal->oai_pmh_url,
                'cover_image_url' => $journal->cover_image_url,
                'publisher' => $journal->publisher,
                'frequency' => $journal->frequency,
                'frequency_label' => $journal->frequency_label,
                'first_published_year' => $journal->first_published_year,
                'editor_in_chief' => $journal->editor_in_chief,
                'email' => $journal->email,
                'about' => $journal->about,
                'scope' => $journal->scope,
                // SINTA details
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
                // Accreditation details (merged)
                'accreditation_label' => $journal->accreditation_label,
                'accreditation_start_year' => $journal->accreditation_start_year,
                'accreditation_end_year' => $journal->accreditation_end_year,
                'accreditation_sk_number' => $journal->accreditation_sk_number,
                'accreditation_sk_date' => $journal->accreditation_sk_date?->format('Y-m-d'),
                'accreditation_expiry_status' => $journal->accreditation_expiry_status,
                // Indexation
                'indexed_in' => $journal->indexed_in,
                'indexation_labels' => $journal->indexation_labels,
                // Relationships
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                    'code' => $journal->university->code,
                    'address' => $journal->university->address,
                    'city' => $journal->university->city,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'articles_count' => $articlesCount,
            ],
            'articles' => $articles,
            'issuesList' => $issuesList,
            'articlesByYear' => $articlesByYear,
            'queries' => $request->all(),
        ]);
    }

    /**
     * Browse journals grouped by universities.
     *
     * @route GET /browse/universities
     *
     * @features Browse all universities with their approved journals, filter by university, pagination
     */
    public function browseUniversities(Request $request): Response
    {
        // Get university statistics (cached for 1 hour)
        $universityStats = Cache::remember('browse.universities.stats', 3600, function () {
            return University::where('is_active', true)
                ->withCount([
                    'journals' => function ($query) {
                        $query->where('is_active', true)
                            ->where('approval_status', 'approved');
                    },
                ])
                ->having('journals_count', '>', 0)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'short_name']);
        });

        // If specific university selected, show its journals
        $selectedUniversity = null;
        $journals = null;

        if ($request->filled('university_id')) {
            $selectedUniversity = University::find($request->university_id);

            if ($selectedUniversity) {
                // Get journals for selected university with pagination
                $journals = Journal::query()
                    ->with(['scientificField'])
                    ->where('university_id', $request->university_id)
                    ->where('is_active', true)
                    ->where('approval_status', 'approved')
                    ->orderBy('title')
                    ->paginate(12)
                    ->withQueryString()
                    ->through(fn ($journal) => [
                        'id' => $journal->id,
                        'title' => $journal->title,
                        'issn' => $journal->issn,
                        'e_issn' => $journal->e_issn,
                        'url' => $journal->url,
                        'scientific_field' => $journal->scientificField ? [
                            'id' => $journal->scientificField->id,
                            'name' => $journal->scientificField->name,
                        ] : null,
                        'sinta_rank' => $journal->sinta_rank,
                        'sinta_rank_label' => $journal->sinta_rank_label,
                        'is_indexed_in_scopus' => $journal->is_indexed_in_scopus,
                    ]);
            }
        }

        return Inertia::render('Browse/Universities', [
            'universityStats' => $universityStats,
            'selectedUniversity' => $selectedUniversity ? [
                'id' => $selectedUniversity->id,
                'name' => $selectedUniversity->name,
                'code' => $selectedUniversity->code,
                'short_name' => $selectedUniversity->short_name,
            ] : null,
            'journals' => $journals,
            'filters' => $request->only(['university_id']),
        ]);
    }
}
