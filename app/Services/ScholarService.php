<?php

namespace App\Services;

use App\Models\User;

class ScholarService
{
    /**
     * Fetch citation statistics for the given user from Google Scholar.
     *
     * Dummy implementation: generates deterministic pseudo-random stats per
     * user so repeated syncs return consistent data. In a real application
     * this would call the Google Scholar API (or scrape) using the user's
     * scholar profile ID.
     *
     * @return array{h_index: int, total_citations: int, yearly_data: array<int, array{year: int, citations: int}>}
     */
    public function fetch(User $user): array
    {
        // Seed from the user so each user gets stable dummy data
        mt_srand(crc32($user->email));

        $currentYear = now()->year;
        $yearlyData = [];
        $totalCitations = 0;

        // Last 5 years; 10–100 citations each keeps the total within 50–500
        foreach (range($currentYear - 4, $currentYear) as $year) {
            $citations = mt_rand(10, 100);
            $yearlyData[] = ['year' => $year, 'citations' => $citations];
            $totalCitations += $citations;
        }

        return [
            'h_index' => mt_rand(5, 30),
            'total_citations' => $totalCitations,
            'yearly_data' => $yearlyData,
        ];
    }
}
