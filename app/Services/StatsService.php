<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * Calculate the success rate (percentage of approved proposals)
     * out of total proposals that have a final decision (approved or rejected).
     *
     * @param  int|null  $userId        Filter by specific user (Dosen/Pengelola Jurnal)
     * @param  int|null  $universityId  Filter by specific university (Admin Kampus)
     * @return float  Percentage 0–100, rounded to 1 decimal place
     */
    public function successRate(?int $userId = null, ?int $universityId = null): float
    {
        $query = DB::table('pembinaan_registrations')
            ->whereNull('deleted_at');

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        if ($universityId !== null) {
            $query->join('journals', 'pembinaan_registrations.journal_id', '=', 'journals.id')
                ->where('journals.university_id', $universityId)
                ->select('pembinaan_registrations.*');
        }

        // Clone query for different status counts
        $decidedQuery = clone $query;

        $approved = (clone $query)->where('pembinaan_registrations.status', 'approved')->count();
        $decided   = $decidedQuery
            ->whereIn('pembinaan_registrations.status', ['approved', 'rejected'])
            ->count();

        if ($decided === 0) {
            return 0.0;
        }

        return round(($approved / $decided) * 100, 1);
    }

    /**
     * Get a full proposal statistics summary for a user.
     *
     * Returns:
     * - total:    all proposals ever submitted by this user
     * - masuk:    proposals with status pending (submitted, waiting review)
     * - lolos:    proposals with status approved
     * - gagal:    proposals with status rejected
     * - success_rate: percentage of lolos out of decided (lolos+gagal)
     *
     * @param  int  $userId
     * @return array{total: int, masuk: int, lolos: int, gagal: int, success_rate: float}
     */
    public function getProposalSummaryForUser(int $userId): array
    {
        $counts = DB::table('pembinaan_registrations')
            ->whereNull('deleted_at')
            ->where('user_id', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as gagal
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);

        $successRate = $this->successRate(userId: $userId);

        return [
            'total'        => $total,
            'masuk'        => $masuk,
            'lolos'        => $lolos,
            'gagal'        => $gagal,
            'success_rate' => $successRate,
        ];
    }

    /**
     * Get a full proposal statistics summary scoped to a university.
     *
     * @param  int  $universityId
     * @return array{total: int, masuk: int, lolos: int, gagal: int, success_rate: float}
     */
    public function getProposalSummaryForUniversity(int $universityId): array
    {
        $counts = DB::table('pembinaan_registrations as pr')
            ->join('journals', 'pr.journal_id', '=', 'journals.id')
            ->whereNull('pr.deleted_at')
            ->where('journals.university_id', $universityId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN pr.status = 'pending'  THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN pr.status = 'approved' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN pr.status = 'rejected' THEN 1 ELSE 0 END) as gagal
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);

        $successRate = $this->successRate(universityId: $universityId);

        return [
            'total'        => $total,
            'masuk'        => $masuk,
            'lolos'        => $lolos,
            'gagal'        => $gagal,
            'success_rate' => $successRate,
        ];
    }

    /**
     * Get system-wide proposal statistics (Super Admin).
     *
     * @return array{total: int, masuk: int, lolos: int, gagal: int, success_rate: float}
     */
    public function getProposalSummaryAll(): array
    {
        $counts = DB::table('pembinaan_registrations')
            ->whereNull('deleted_at')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as gagal
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);

        $successRate = $this->successRate();

        return [
            'total'        => $total,
            'masuk'        => $masuk,
            'lolos'        => $lolos,
            'gagal'        => $gagal,
            'success_rate' => $successRate,
        ];
    }
}
