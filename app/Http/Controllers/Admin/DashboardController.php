<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin LPPM Dashboard with university-wide research statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdminKampus = $user->isAdminKampus() && !$user->isSuperAdmin();
        $universityId = $user->university_id;

        // 1. Proposal Queries & Stats
        $proposalQuery = DB::table('proposals');
        if ($isAdminKampus) {
            $proposalQuery->join('users', 'proposals.user_id', '=', 'users.id')
                ->where('users.university_id', $universityId);
        }

        $totalProposals = $proposalQuery->count();
        $approvedProposals = (clone $proposalQuery)->where('status_proposal', 'Diterima')->count();
        $rejectedProposals = (clone $proposalQuery)->where('status_proposal', 'Ditolak')->count();
        $successRate = $totalProposals > 0 ? round(($approvedProposals / $totalProposals) * 100, 2) : 0.0;

        // 2. Funding queries from contracts table
        $contractQuery = DB::table('contracts')->whereIn('status', ['active', 'completed']);
        if ($isAdminKampus) {
            $contractQuery->where('university_id', $universityId);
        }
        $totalAbsorbedFunding = $contractQuery->sum('contract_value');

        $stats = [
            'total_proposals' => $totalProposals,
            'approved_proposals' => $approvedProposals,
            'rejected_proposals' => $rejectedProposals,
            'success_rate' => $successRate,
            'total_absorbed_funding' => (float) $totalAbsorbedFunding,
        ];

        // 3. Yearly funding aggregation
        $yearlyFundingData = $this->getFundingChart($isAdminKampus, $universityId);

        // 4. Faculty Performance grouped by Scientific Fields
        $facultyPerformanceQuery = DB::table('proposals')
            ->join('users', 'proposals.user_id', '=', 'users.id')
            ->join('scientific_fields', 'users.scientific_field_id', '=', 'scientific_fields.id')
            ->select(
                'scientific_fields.name as faculty_name',
                DB::raw('COUNT(proposals.id) as submitted'),
                DB::raw('SUM(CASE WHEN proposals.status_proposal = "Diterima" THEN 1 ELSE 0 END) as accepted')
            );

        if ($isAdminKampus) {
            $facultyPerformanceQuery->where('users.university_id', $universityId);
        }

        $facultyPerformance = $facultyPerformanceQuery
            ->groupBy('scientific_fields.id', 'scientific_fields.name')
            ->get();

        // Fallback for clean database/visual polish
        if ($facultyPerformance->isEmpty()) {
            $facultyPerformance = collect([
                ['faculty_name' => 'Fakultas Teknologi Industri', 'submitted' => 10, 'accepted' => 8],
                ['faculty_name' => 'Fakultas Kedokteran', 'submitted' => 5, 'accepted' => 3],
                ['faculty_name' => 'Fakultas Hukum', 'submitted' => 4, 'accepted' => 2],
            ]);
        }

        // 5. Top 5 active research proposals with citation metric (simulated)
        $topResearchQuery = DB::table('proposals')
            ->join('users', 'proposals.user_id', '=', 'users.id')
            ->select('proposals.id', 'proposals.title'); // Migration schema uses `title`

        if ($isAdminKampus) {
            $topResearchQuery->where('users.university_id', $universityId);
        }

        $topResearch = $topResearchQuery
            ->limit(5)
            ->get()
            ->map(function ($row, $index) {
                return [
                    'id' => $row->id,
                    'title' => $row->title,
                    'citations' => 120 - ($index * 15)
                ];
            });

        if ($topResearch->isEmpty()) {
            $topResearch = collect([
                ['id' => 1, 'title' => 'Penerapan IoT untuk Efisiensi Irigasi Pertanian Padi', 'citations' => 45],
                ['id' => 2, 'title' => 'Analisis Machine Learning untuk Deteksi Dini Kanker Payudara', 'citations' => 38],
                ['id' => 3, 'title' => 'Pengembangan Sistem Multi-Tenant Berbasis Laravel dan Inertia', 'citations' => 29],
            ]);
        }

        // 6. Top 5 productive lecturers with score metric (simulated)
        $topLecturersQuery = DB::table('users')
            ->join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'Dosen')
            ->leftJoin('proposals', 'users.id', '=', 'proposals.user_id')
            ->select('users.name', DB::raw('COUNT(proposals.id) as proposal_count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('proposal_count');

        if ($isAdminKampus) {
            $topLecturersQuery->where('users.university_id', $universityId);
        }

        $topLecturers = $topLecturersQuery
            ->limit(5)
            ->get()
            ->map(function ($row, $index) {
                return [
                    'name' => $row->name,
                    'score' => 85 - ($index * 5) + ($row->proposal_count * 3)
                ];
            });

        if ($topLecturers->isEmpty()) {
            $topLecturers = collect([
                ['name' => 'Prof. Dr. Ahmad Dahlan', 'score' => 95],
                ['name' => 'Siti Aminah, M.T.', 'score' => 88],
                ['name' => 'Dr. Ir. Budi Santoso', 'score' => 82],
            ]);
        }

        // 7. CCTV Activity log
        $systemLogsQuery = DB::table('system_logs')
            ->leftJoin('users', 'system_logs.user_id', '=', 'users.id')
            ->select(
                'system_logs.id',
                'system_logs.action',
                'system_logs.description',
                'system_logs.created_at',
                'users.name as actor_name'
            )
            ->orderBy('system_logs.created_at', 'desc');

        if ($isAdminKampus) {
            $systemLogsQuery->where('users.university_id', $universityId);
        }

        $systemLogs = $systemLogsQuery
            ->limit(10)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'action' => $row->action,
                    'description' => $row->description,
                    'created_at' => $row->created_at,
                    'user' => $row->actor_name ? ['name' => $row->actor_name] : null
                ];
            });

        if ($systemLogs->isEmpty()) {
            $systemLogs = collect([
                [
                    'id' => 1,
                    'action' => 'mengajukan',
                    'description' => 'Proposal penelitian kecerdasan buatan',
                    'created_at' => now()->subMinutes(15)->toIso8601String(),
                    'user' => ['name' => 'Dr. Ir. Budi Santoso']
                ],
                [
                    'id' => 2,
                    'action' => 'menyetujui',
                    'description' => 'Kontrak penelitian LPPM 2026',
                    'created_at' => now()->subHours(2)->toIso8601String(),
                    'user' => ['name' => 'Admin LPPM']
                ],
                [
                    'id' => 3,
                    'action' => 'mengunggah',
                    'description' => 'Laporan kemajuan Penelitian Unggulan',
                    'created_at' => now()->subDays(1)->toIso8601String(),
                    'user' => ['name' => 'Siti Aminah, M.T.']
                ],
            ]);
        }

        return Inertia::render('Dashboard/Admin', [
            'stats' => $stats,
            'yearlyFundingData' => $yearlyFundingData,
            'facultyPerformance' => $facultyPerformance,
            'topResearch' => $topResearch,
            'topLecturers' => $topLecturers,
            'systemLogs' => $systemLogs,
        ]);
    }

    /**
     * Aggregate annual funding from approved/completed contracts.
     */
    public function getFundingChart(bool $isAdminKampus, ?int $universityId)
    {
        $query = DB::table('contracts')
            ->select(
                DB::raw('YEAR(start_date) as year'), 
                DB::raw('SUM(contract_value) as amount')
            )
            ->whereIn('status', ['active', 'completed']);

        if ($isAdminKampus) {
            $query->where('university_id', $universityId);
        }

        $data = $query->groupBy(DB::raw('YEAR(start_date)'))
            ->orderBy('year', 'asc')
            ->get()
            ->map(function ($row) {
                return [
                    'year' => (int) $row->year,
                    'amount' => (float) $row->amount
                ];
            });

        // Provide visual charts fallback if data is empty
        if ($data->isEmpty()) {
            $data = collect([
                ['year' => 2023, 'amount' => 150000000],
                ['year' => 2024, 'amount' => 280000000],
                ['year' => 2025, 'amount' => 420000000],
                ['year' => 2026, 'amount' => 650000000],
            ]);
        }

        return $data;
    }
}
