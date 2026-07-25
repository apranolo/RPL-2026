<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * StatsService — aggregate statistics for the Dashboard.
 *
 * All public methods read from the `proposals` table (Modul 1 – Manajemen
 * Proposal Penelitian) as specified in Modul 6 (Dashboard dan Pelaporan) of
 * the Sistem Penelitian Terintegrasi PRD.
 *
 * Status mapping:
 *  - "masuk"  → submitted   (proposal diajukan, menunggu review administrasi)
 *  - "lolos"  → administrasi_valid (proposal lulus verifikasi administrasi)
 *  - "gagal"  → ditolak     (proposal tidak lulus)
 *  - "draft"  → excluded from success-rate calculation
 */
class StatsService
{
    /**
     * Calculate the success rate (percentage of approved proposals)
     * out of total proposals that have a final decision
     * (administrasi_valid or ditolak) — drafts are excluded.
     *
     * @param  int|null  $userId  Filter by specific researcher (Dosen)
     * @param  int|null  $universityId  Filter by specific university (Admin Kampus)
     *                                  Scoped via the pengusul's university_id.
     * @return float Percentage 0–100, rounded to 1 decimal place
     */
    public function successRate(?int $userId = null, ?int $universityId = null): float
    {
        $query = DB::table('proposals');

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        if ($universityId !== null) {
            $query->whereIn('user_id', function ($sub) use ($universityId) {
                $sub->select('id')
                    ->from('users')
                    ->where('university_id', $universityId);
            });
        }

        $approved = (clone $query)
            ->whereIn('status_proposal', ['Administrasi_Valid', 'administrasi_valid', 'approved'])
            ->count();

        $decided = (clone $query)
            ->whereIn('status_proposal', ['Administrasi_Valid', 'administrasi_valid', 'approved', 'Ditolak', 'ditolak', 'rejected'])
            ->count();

        if ($decided === 0) {
            return 0.0;
        }

        return round(($approved / $decided) * 100, 1);
    }

    /**
     * Get a full proposal statistics summary for a single researcher.
     */
    public function getProposalSummaryForUser(int $userId): array
    {
        $counts = DB::table('proposals')
            ->where('user_id', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_proposal IN ('Submitted', 'submitted') THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status_proposal IN ('Administrasi_Valid', 'administrasi_valid', 'approved') THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status_proposal IN ('Ditolak', 'ditolak', 'rejected') THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN status_proposal IN ('Draft', 'draft') THEN 1 ELSE 0 END) as draft
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(userId: $userId),
            'total_pendanaan' => 0.0,
        ];
    }

    /**
     * Get a full proposal statistics summary scoped to a university.
     */
    public function getProposalSummaryForUniversity(int $universityId): array
    {
        $counts = DB::table('proposals as p')
            ->join('users', 'p.user_id', '=', 'users.id')
            ->where('users.university_id', $universityId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN p.status_proposal IN ('Submitted', 'submitted') THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN p.status_proposal IN ('Administrasi_Valid', 'administrasi_valid', 'approved') THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN p.status_proposal IN ('Ditolak', 'ditolak', 'rejected') THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN p.status_proposal IN ('Draft', 'draft') THEN 1 ELSE 0 END) as draft
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(universityId: $universityId),
            'total_pendanaan' => 0.0,
        ];
    }

    /**
     * Get system-wide proposal statistics (Super Admin view).
     */
    public function getProposalSummaryAll(): array
    {
        $counts = DB::table('proposals')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_proposal IN ('Submitted', 'submitted') THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status_proposal IN ('Administrasi_Valid', 'administrasi_valid', 'approved') THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status_proposal IN ('Ditolak', 'ditolak', 'rejected') THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN status_proposal IN ('Draft', 'draft') THEN 1 ELSE 0 END) as draft
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(),
            'total_pendanaan' => 0.0,
        ];
    }
}
