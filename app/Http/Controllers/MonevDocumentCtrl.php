<?php

namespace App\Http\Controllers;

use App\Models\Evaluation; // Model sudah diganti menjadi Evaluation
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonevDocumentCtrl extends Controller
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
        // Menggunakan Evaluation dan ProgressReport (sesuai modul Monev)
        // -----------------------------------------------------------------
        $query = Evaluation::query()
            ->with([
                'progressReport.user.university',
                'reviewer',
            ])
            ->orderByDesc('created_at'); // Menggunakan created_at sebagai standar

        // -----------------------------------------------------------------
        // 2. Scope by role
        // -----------------------------------------------------------------
        if ($user->role->name === 'Admin Kampus') {
            $query->whereHas('progressReport.user', function ($q) use ($user) {
                $q->where('university_id', $user->university_id);
            });
        } elseif ($user->role->name !== 'Super Admin') {
            // Regular user – only own progress reports/evaluations
            $query->whereHas('progressReport', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // -----------------------------------------------------------------
        // 3. Optional filters from query-string
        // -----------------------------------------------------------------
        if ($request->filled('period')) {
            $query->whereHas('progressReport', function ($q) use ($request) {
                $q->where('period', $request->input('period'));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $evaluations = $query->get();

        // -----------------------------------------------------------------
        // 4. Aggregate statistics
        // -----------------------------------------------------------------
        $statistics = [
            'total'         => $evaluations->count(),
            'average_score' => $evaluations->avg('score') ?? 0, // Asumsi nama field adalah score
            'max_score'     => $evaluations->max('score') ?? 0,
            'min_score'     => $evaluations->min('score') ?? 0,
            'by_status'     => $evaluations->groupBy('status')->map->count(),
        ];

        // -----------------------------------------------------------------
        // 5. Render the print-optimised Blade view
        // -----------------------------------------------------------------
        return view('print.evaluasi', [
            'evaluations' => $evaluations, // Variabel diubah menyesuaikan model
            'statistics'  => $statistics,
            'user'        => $user,
            'filters'     => $request->only(['period', 'status']),
            'printDate'   => now()->translatedFormat('d F Y, H:i'),
        ]);
    }
}