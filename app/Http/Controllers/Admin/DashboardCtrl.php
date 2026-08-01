<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardCtrl extends Controller
{
    /**
     * Get aggregated Monitoring & Evaluasi (Monev) statistics for charts.
     *
     * Returns JSON with:
     * - registration_status : count of pembinaan registrations grouped by status
     * - assessment_status   : count of assessments grouped by status
     * - by_category         : breakdown per pembinaan category (akreditasi / indeksasi)
     * - pembinaan_summary   : per-pembinaan program stats
     */
    public function getMonevStat(Request $request): JsonResponse
    {
        // ── 1. Registration Status Aggregation ────────────
        $registrationStatus = PembinaanRegistration::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all statuses are present
        $registrationStatus = array_merge(
            ['pending' => 0, 'approved' => 0, 'rejected' => 0],
            $registrationStatus
        );

        // ── 2. Assessment Status Aggregation ──────────────
        $assessmentStatus = JournalAssessment::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all statuses are present
        $assessmentStatus = array_merge(
            ['draft' => 0, 'submitted' => 0, 'reviewed' => 0],
            $assessmentStatus
        );

        // ── 3. Breakdown by Pembinaan Category ────────────
        $byCategory = Pembinaan::query()
            ->select('category')
            ->withCount([
                'registrations',
                'registrations as pending_count' => function ($q) {
                    $q->where('status', 'pending');
                },
                'registrations as approved_count' => function ($q) {
                    $q->where('status', 'approved');
                },
                'registrations as rejected_count' => function ($q) {
                    $q->where('status', 'rejected');
                },
            ])
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category => [
                    'category' => $item->category,
                    'label' => $item->category === 'akreditasi' ? 'Akreditasi' : 'Indeksasi',
                    'total_registrations' => $item->registrations_count,
                    'pending' => $item->pending_count,
                    'approved' => $item->approved_count,
                    'rejected' => $item->rejected_count,
                ]];
            })
            ->toArray();

        // Alternative approach using a direct aggregation for accuracy
        $categoryStats = DB::table('pembinaan_registrations')
            ->join('pembinaan', 'pembinaan_registrations.pembinaan_id', '=', 'pembinaan.id')
            ->select(
                'pembinaan.category',
                'pembinaan_registrations.status',
                DB::raw('COUNT(*) as count')
            )
            ->whereNull('pembinaan_registrations.deleted_at')
            ->whereNull('pembinaan.deleted_at')
            ->groupBy('pembinaan.category', 'pembinaan_registrations.status')
            ->get();

        $byCategory = [];
        foreach (['akreditasi', 'indeksasi'] as $category) {
            $categoryData = $categoryStats->where('category', $category);
            $byCategory[$category] = [
                'category' => $category,
                'label' => $category === 'akreditasi' ? 'Akreditasi' : 'Indeksasi',
                'total' => $categoryData->sum('count'),
                'pending' => $categoryData->where('status', 'pending')->sum('count'),
                'approved' => $categoryData->where('status', 'approved')->sum('count'),
                'rejected' => $categoryData->where('status', 'rejected')->sum('count'),
            ];
        }

        // ── 4. Per-Pembinaan Summary ──────────────────────
        $pembinaanSummary = Pembinaan::query()
            ->select('id', 'name', 'category', 'status')
            ->withCount([
                'registrations',
                'registrations as pending_count' => function ($q) {
                    $q->where('status', 'pending');
                },
                'registrations as approved_count' => function ($q) {
                    $q->where('status', 'approved');
                },
                'registrations as rejected_count' => function ($q) {
                    $q->where('status', 'rejected');
                },
            ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($pembinaan) {
                return [
                    'id' => $pembinaan->id,
                    'name' => $pembinaan->name,
                    'category' => $pembinaan->category,
                    'status' => $pembinaan->status,
                    'total_registrations' => $pembinaan->registrations_count,
                    'pending' => $pembinaan->pending_count,
                    'approved' => $pembinaan->approved_count,
                    'rejected' => $pembinaan->rejected_count,
                ];
            })
            ->toArray();

        // ── 5. Assessment Linked to Pembinaan ─────────────
        $assessmentByPembinaan = JournalAssessment::query()
            ->whereNotNull('pembinaan_registration_id')
            ->join('pembinaan_registrations', 'journal_assessments.pembinaan_registration_id', '=', 'pembinaan_registrations.id')
            ->join('pembinaan', 'pembinaan_registrations.pembinaan_id', '=', 'pembinaan.id')
            ->select(
                'pembinaan.category',
                'journal_assessments.status',
                DB::raw('COUNT(*) as count')
            )
            ->whereNull('journal_assessments.deleted_at')
            ->groupBy('pembinaan.category', 'journal_assessments.status')
            ->get();

        $assessmentByCategory = [];
        foreach (['akreditasi', 'indeksasi'] as $category) {
            $catData = $assessmentByPembinaan->where('category', $category);
            $assessmentByCategory[$category] = [
                'category' => $category,
                'label' => $category === 'akreditasi' ? 'Akreditasi' : 'Indeksasi',
                'draft' => $catData->where('status', 'draft')->sum('count'),
                'submitted' => $catData->where('status', 'submitted')->sum('count'),
                'reviewed' => $catData->where('status', 'reviewed')->sum('count'),
                'total' => $catData->sum('count'),
            ];
        }

        return response()->json([
            'registration_status' => $registrationStatus,
            'assessment_status' => $assessmentStatus,
            'by_category' => array_values($byCategory),
            'assessment_by_category' => array_values($assessmentByCategory),
            'pembinaan_summary' => $pembinaanSummary,
        ]);
    }
}
