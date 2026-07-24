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
        $query = DB::table('proposals')
            ->whereNull('deleted_at');

        if ($userId !== null) {
            $query->where('id_pengusul', $userId);
        }

        if ($universityId !== null) {
            $query->whereIn('id_pengusul', function ($sub) use ($universityId) {
                $sub->select('id')
                    ->from('users')
                    ->where('university_id', $universityId);
            });
        }

        $approved = (clone $query)
            ->where('status_proposal', 'administrasi_valid')
            ->count();

        $decided = (clone $query)
            ->whereIn('status_proposal', ['administrasi_valid', 'ditolak'])
            ->count();

        if ($decided === 0) {
            return 0.0;
        }

        return round(($approved / $decided) * 100, 1);
    }

    /**
     * Get a full proposal statistics summary for a single researcher.
     *
     * Returns:
     * - total:              all proposals ever submitted by this researcher
     * - masuk:             proposals with status "submitted" (waiting admin review)
     * - lolos:             proposals with status "administrasi_valid" (approved)
     * - gagal:             proposals with status "ditolak" (rejected)
     * - draft:             proposals still in draft state
     * - success_rate:      percentage of lolos out of decided (lolos + gagal)
     * - total_pendanaan:   sum of approved funding amounts (IDR)
     *
     * @return array{total: int, masuk: int, lolos: int, gagal: int, draft: int, success_rate: float, total_pendanaan: float}
     */
    public function getProposalSummaryForUser(int $userId): array
    {
        $counts = DB::table('proposals')
            ->whereNull('deleted_at')
            ->where('id_pengusul', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_proposal = 'submitted'          THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status_proposal = 'administrasi_valid' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status_proposal = 'ditolak'            THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN status_proposal = 'draft'              THEN 1 ELSE 0 END) as draft,
                COALESCE(SUM(CASE WHEN status_proposal = 'administrasi_valid'
                    THEN total_pendanaan_disetujui ELSE 0 END), 0) as total_pendanaan
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);
        $totalPendanaan = (float) ($counts->total_pendanaan ?? 0.0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(userId: $userId),
            'total_pendanaan' => $totalPendanaan,
        ];
    }

    /**
     * Get a full proposal statistics summary scoped to a university.
     *
     * Scoped via the `id_pengusul` → `users.university_id` join so that
     * only proposals submitted by researchers belonging to the given
     * university are counted.
     *
     * @return array{total: int, masuk: int, lolos: int, gagal: int, draft: int, success_rate: float, total_pendanaan: float}
     */
    public function getProposalSummaryForUniversity(int $universityId): array
    {
        $counts = DB::table('proposals as p')
            ->join('users', 'p.id_pengusul', '=', 'users.id')
            ->whereNull('p.deleted_at')
            ->where('users.university_id', $universityId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN p.status_proposal = 'submitted'          THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN p.status_proposal = 'administrasi_valid' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN p.status_proposal = 'ditolak'            THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN p.status_proposal = 'draft'              THEN 1 ELSE 0 END) as draft,
                COALESCE(SUM(CASE WHEN p.status_proposal = 'administrasi_valid'
                    THEN p.total_pendanaan_disetujui ELSE 0 END), 0) as total_pendanaan
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);
        $totalPendanaan = (float) ($counts->total_pendanaan ?? 0.0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(universityId: $universityId),
            'total_pendanaan' => $totalPendanaan,
        ];
    }

    /**
     * Get system-wide proposal statistics (Super Admin view).
     *
     * @return array{total: int, masuk: int, lolos: int, gagal: int, draft: int, success_rate: float, total_pendanaan: float}
     */
    public function getProposalSummaryAll(): array
    {
        $counts = DB::table('proposals')
            ->whereNull('deleted_at')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_proposal = 'submitted'          THEN 1 ELSE 0 END) as masuk,
                SUM(CASE WHEN status_proposal = 'administrasi_valid' THEN 1 ELSE 0 END) as lolos,
                SUM(CASE WHEN status_proposal = 'ditolak'            THEN 1 ELSE 0 END) as gagal,
                SUM(CASE WHEN status_proposal = 'draft'              THEN 1 ELSE 0 END) as draft,
                COALESCE(SUM(CASE WHEN status_proposal = 'administrasi_valid'
                    THEN total_pendanaan_disetujui ELSE 0 END), 0) as total_pendanaan
            ")
            ->first();

        $total = (int) ($counts->total ?? 0);
        $masuk = (int) ($counts->masuk ?? 0);
        $lolos = (int) ($counts->lolos ?? 0);
        $gagal = (int) ($counts->gagal ?? 0);
        $draft = (int) ($counts->draft ?? 0);
        $totalPendanaan = (float) ($counts->total_pendanaan ?? 0.0);

        return [
            'total' => $total,
            'masuk' => $masuk,
            'lolos' => $lolos,
            'gagal' => $gagal,
            'draft' => $draft,
            'success_rate' => $this->successRate(),
            'total_pendanaan' => $totalPendanaan,
        ];
    }
}
