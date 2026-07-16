<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Funding;

class FundingService
{
    /**
     * Menghitung sisa dana kontrak yang belum dialokasikan ke termin.
     *
     * @return array{total_pendanaan: float, total_dialokasikan: float, total_cair: float, sisa_dana: float, sisa_persentase: float}
     */
    public function calculateSisa(Contract $contract): array
    {
        $totalPendanaan = (float) $contract->contract_value;

        $fundings = $contract->fundings()
            ->where('status', '!=', Funding::STATUS_CANCELLED)
            ->get();

        $totalDialokasikan = $fundings->sum('amount');
        $totalPersentase = (float) $fundings->sum('percentage');
        $totalCair = (float) $fundings
            ->where('status', Funding::STATUS_DISBURSED)
            ->sum('amount');

        return [
            'total_pendanaan' => $totalPendanaan,
            'total_dialokasikan' => (float) $totalDialokasikan,
            'total_cair' => $totalCair,
            'sisa_dana' => $totalPendanaan - (float) $totalDialokasikan,
            'sisa_persentase' => round(100 - $totalPersentase, 2),
        ];
    }

    /**
     * Memvalidasi bahwa akumulasi persentase seluruh termin tidak melebihi 100%.
     */
    public function validateTerminPercentage(Contract $contract, float $newPercentage, ?int $excludeId = null): bool
    {
        $query = $contract->fundings()
            ->where('status', '!=', Funding::STATUS_CANCELLED);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $currentTotal = (float) $query->sum('percentage');

        return ($currentTotal + $newPercentage) <= 100.00;
    }

    /**
     * Auto-generate nomor termin unik berdasarkan kontrak.
     */
    public function generateFundingNumber(Contract $contract): string
    {
        $existingCount = $contract->fundings()->count();
        $terminNumber = $existingCount + 1;

        return 'TRM-' . $contract->id . '-' . str_pad((string) $terminNumber, 3, '0', STR_PAD_LEFT);
    }
}
