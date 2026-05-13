<?php

namespace App\Http\Controllers;

use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonevDocumentCtrl extends Controller
{
    /**
     * Print rekap evaluasi monev (monitoring & evaluasi).
     *
     * Renders a print-optimized Blade view containing the evaluation recap
     * data. The rendered HTML page includes print CSS so the user can
     * Ctrl+P / Cmd+P to produce a PDF directly from the browser.
     *
     * Access is scoped by the authenticated user's role:
     *  - Super Admin  → all assessments
     *  - Admin Kampus → assessments within their university
     *  - User         → only their own assessments
     *
     * @return \Illuminate\Contracts\View\View
     */
    public function printRekap(Request $request)
    {
        $user = $request->user()->load(['role', 'university']);

        // -----------------------------------------------------------------
        // 1. Build base query with necessary eager-loads
        // -----------------------------------------------------------------
        $query = JournalAssessment::query()
            ->with([
                'journal.university',
                'journal.scientificField',
                'user',
                'reviewer',
            ])
            ->whereNotNull('total_score')
            ->orderByDesc('assessment_date');

        // -----------------------------------------------------------------
        // 2. Scope by role
        // -----------------------------------------------------------------
        if ($user->role->name === 'Admin Kampus') {
            $query->whereHas('journal', function ($q) use ($user) {
                $q->where('university_id', $user->university_id);
            });
        } elseif ($user->role->name !== 'Super Admin') {
            // Regular user – only own assessments
            $query->where('user_id', $user->id);
        }

        // -----------------------------------------------------------------
        // 3. Optional filters from query-string
        // -----------------------------------------------------------------
        if ($request->filled('period')) {
            $query->where('period', $request->input('period'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $assessments = $query->get();

        // -----------------------------------------------------------------
        // 4. Aggregate statistics
        // -----------------------------------------------------------------
        $statistics = [
            'total'         => $assessments->count(),
            'average_score' => $assessments->avg('percentage') ?? 0,
            'max_score'     => $assessments->max('percentage') ?? 0,
            'min_score'     => $assessments->min('percentage') ?? 0,
            'by_status'     => $assessments->groupBy('status')->map->count(),
            'by_grade'      => $assessments->groupBy('grade')->map->count(),
        ];

        // -----------------------------------------------------------------
        // 5. Render the print-optimised Blade view
        // -----------------------------------------------------------------
        return view('print.evaluasi', [
            'assessments' => $assessments,
            'statistics'  => $statistics,
            'user'        => $user,
            'filters'     => $request->only(['period', 'status']),
            'printDate'   => now()->translatedFormat('d F Y, H:i'),
        ]);
    }
}
