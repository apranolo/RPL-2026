<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Support\Facades\Cache;

class PublicHomeService
{
    /**
     * Get featured journals with random ordering, cached for performance.
     */
    public function getFeaturedJournals()
    {
        return Cache::remember('featured_journals_welcome', now()->addDay(), function () {
            return Journal::with(['university', 'scientificField'])
                ->where('is_active', true)
                ->whereNotNull('sinta_rank')
                ->whereIn('sinta_rank', ['sinta_1', 'sinta_2'])
                ->inRandomOrder()
                ->limit(4)
                ->get()
                ->map(fn ($journal) => [
                    'id' => $journal->id,
                    'title' => $journal->title,
                    'sinta_rank' => $journal->sinta_rank,
                    'sinta_rank_label' => $journal->sinta_rank_label,
                    'issn' => $journal->issn,
                    'e_issn' => $journal->e_issn,
                    'university' => $journal->university->name ?? 'Unknown',
                    'cover_image_url' => $journal->cover_image_url,
                    'indexation_labels' => $journal->indexation_labels,
                ]);
        });
    }

    /**
     * Force refresh the featured journals cache
     */
    public function refreshFeaturedJournalsCache(): void
    {
        Cache::forget('featured_journals_welcome');
        // Re-warm the cache immediately
        $this->getFeaturedJournals();
    }

    /**
     * Get SINTA statistics (cached)
     */
    public function getSintaStats()
    {
        return Cache::remember('home_sinta_stats', now()->addHours(6), function () {
            $stats = [];
            for ($rank = 1; $rank <= 6; $rank++) {
                $key = 'sinta_'.$rank;
                $stats[$key] = Journal::where('is_active', true)
                    ->where('sinta_rank', $key)
                    ->count();
            }

            // Non-SINTA (Unaccredited but Indexed)
            $stats['non_sinta'] = Journal::where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('sinta_rank')
                        ->orWhere('sinta_rank', '');
                })
                ->whereNotNull('indexations')
                ->where('indexations', '!=', '[]')
                ->where('indexations', '!=', '')
                ->count();

            return $stats;
        });
    }

    /**
     * Get overall university, journal, and article counts (cached)
     */
    public function getOverallStats()
    {
        return Cache::remember('home_overall_stats', now()->addHours(6), function () {
            return [
                'totalUniversities' => University::where('is_active', true)
                    ->whereHas('journals', function ($query) {
                        $query->where('is_active', true);
                    })->count(),
                'totalJournals' => Journal::where('is_active', true)->count(),
                'totalArticles' => Article::count(),
            ];
        });
    }

    /**
     * Get indexation statistics (cached)
     */
    public function getIndexationStats()
    {
        return Cache::remember('home_indexation_stats', now()->addHours(6), function () {
            $platforms = ['Scopus', 'Web of Science', 'DOAJ', 'Dimensions', 'EBSCO', 'ProQuest'];
            $stats = [];

            foreach ($platforms as $platform) {
                $stats[strtolower(str_replace(' ', '_', $platform))] = Journal::where('is_active', true)
                    ->whereNotNull('indexations')
                    ->whereRaw("JSON_CONTAINS_PATH(indexations, 'one', '$.\"$platform\"')")
                    ->count();
            }

            return $stats;
        });
    }

    /**
     * Get top scientific fields by journal count (cached)
     */
    public function getTopScientificFields()
    {
        return Cache::remember('home_top_scientific_fields', now()->addHours(6), function () {
            return ScientificField::withCount(['journals' => function ($query) {
                $query->where('is_active', true);
            }])
                ->having('journals_count', '>', 0)
                ->orderByDesc('journals_count')
                ->take(12)
                ->get(['id', 'name']);
        });
    }
}
