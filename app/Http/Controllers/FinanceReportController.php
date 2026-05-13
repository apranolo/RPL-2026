<?php

namespace App\Http\Controllers;

use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceReportController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', now()->year);
        $scheme = $request->get('scheme', 'all');

        $summary = $this->summary($year, $scheme);

        return Inertia::render('Finance/Report/Index', [
            'summary' => $summary,
            'filters' => [
                'year' => $year,
                'scheme' => $scheme,
            ],
        ]);
    }

    public function summary($year = null, $scheme = 'all')
    {
        $year = $year ?? now()->year;

        $query = JournalAssessment::with(['journal.university', 'user'])
            ->whereYear('assessment_date', $year)
            ->when($scheme !== 'all', fn ($query) => $query->where('status', $scheme));

        $assessments = $query->get();

        $totalRevenue = $assessments->count() * 500000; // Assuming 500k per assessment
        $totalExpenses = $assessments->count() * 200000; // Assuming 200k expenses per assessment
        $netProfit = $totalRevenue - $totalExpenses;

        return [
            'total_assessments' => $assessments->count(),
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'year' => $year,
            'scheme' => $scheme,
            'data' => $assessments->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'journal_title' => $assessment->journal->title ?? 'N/A',
                    'university' => $assessment->journal->university->name ?? 'N/A',
                    'assessor' => $assessment->user->name ?? 'N/A',
                    'date' => $assessment->assessment_date,
                    'status' => $assessment->status_label,
                    'status_key' => $assessment->status,
                    'revenue' => 500000,
                    'expenses' => 200000,
                    'profit' => 300000,
                ];
            }),
        ];
    }

    public function filter(Request $request)
    {
        $year = $request->get('year', now()->year);
        $scheme = $request->get('scheme', 'all');

        return response()->json($this->summary($year, $scheme));
    }
}
