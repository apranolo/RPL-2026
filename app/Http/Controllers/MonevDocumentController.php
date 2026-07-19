<?php

namespace App\Http\Controllers;

use App\Models\JournalAssessment;
use Illuminate\Http\Request;

class MonevDocumentController extends Controller
{
    /**
     * Print rekap evaluasi monev (monitoring & evaluasi).
     *
     * Renders a print-optimized Blade view containing the evaluation recap
     * data.
     *
     * Access is scoped by the authenticated user's role:
     * - Super Admin  → all evaluations
     * - Admin Kampus → evaluations within their university
     * - User         → only their own evaluations
     *
     * @return \Illuminate\Contracts\View\View
     */
    public function printRekap(Request $request)
    {
        $user = $request->user()->load(['role', 'university']);

        // -----------------------------------------------------------------
        // 1. Build base query with necessary eager-loads
        // Menggunakan JournalAssessment (sesuai modul Monev)
        // -----------------------------------------------------------------
        $query = JournalAssessment::query()
            ->with([
                'journal.university',
                'user',
            ])
            ->orderByDesc('created_at'); // Menggunakan created_at sebagai standar

        // -----------------------------------------------------------------
        // 2. Scope by role
        // -----------------------------------------------------------------
        if ($user->role->name === 'Admin Kampus') {
            $query->whereHas('journal', function ($q) use ($user) {
                $q->where('university_id', $user->university_id);
            });
        } elseif ($user->role->name !== 'Super Admin') {
            // Regular user – only own progress reports/evaluations
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

        $evaluations = $query->get();

        // -----------------------------------------------------------------
        // 4. Aggregate statistics
        // -----------------------------------------------------------------
        $statistics = [
            'total' => $evaluations->count(),
            'average_score' => $evaluations->avg('percentage') ?? 0,
            'max_score' => $evaluations->max('percentage') ?? 0,
            'min_score' => $evaluations->min('percentage') ?? 0,
            'by_status' => $evaluations->groupBy('status')->map->count(),
            'by_grade' => $evaluations->groupBy('grade')->map->count(),
        ];

        // -----------------------------------------------------------------
        // 5. Render the print-optimised Blade view
        // -----------------------------------------------------------------
        return view('print.evaluasi', [
            'evaluations' => $evaluations,
            'assessments' => $evaluations, // Alias for blade compatibility
            'statistics' => $statistics,
            'user' => $user,
            'filters' => $request->only(['period', 'status']),
            'printDate' => now()->translatedFormat('d F Y, H:i'),
        ]);
    }
}
