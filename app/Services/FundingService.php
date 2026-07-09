<?php

namespace App\Services;

use App\Models\Funding;

class FundingService
{
    /**
     * Hitung sisa dana kontrak berdasarkan total kontrak (jika tersedia)
     * dan total termin yang sudah dicairkan.
     *
     * @param  int  $contractId
     * @return float|int|null  sisa dana atau null jika tidak bisa dihitung
     */
    public static function calculateSisa(int $contractId, $user = null)
    {
        // If user provided, verify contract belongs to user's university
        if ($user && class_exists(\App\Models\Contract::class)) {
            $contract = \App\Models\Contract::where('id', $contractId)
                ->where('university_id', $user->university_id)
                ->first();

            if (! $contract) {
                return null; // not allowed / not found for this user
            }
        }

        $totalPaid = (float) Funding::where('contract_id', $contractId)->sum('amount');

        if (class_exists(\App\Models\Contract::class)) {
            $contract = \App\Models\Contract::find($contractId);
            if ($contract && isset($contract->total_amount)) {
                return max(0, (float) $contract->total_amount - $totalPaid);
            }
        }

        return $totalPaid;
    }
}
