<?php

namespace App\Services;

use App\Models\Funding;
use Illuminate\Support\Facades\DB;

class FundingService
{
    /**
     * Calculate the remaining funds for a contract.
     *
     * @param int $contractId
     * @param float $totalApproved
     * @return float
     */
    public function calculateSisa(int $contractId, float $totalApproved): float
    {
        $totalDisbursed = Funding::where('contract_id', $contractId)
            ->whereIn('status', ['pending', 'disbursed'])
            ->sum('amount');

        return max(0, $totalApproved - $totalDisbursed);
    }

    /**
     * Store a new termin disbursement.
     *
     * @param array $data
     * @return Funding
     */
    public function storeTermin(array $data): Funding
    {
        return DB::transaction(function () use ($data) {
            $funding = new Funding();
            $funding->contract_id = $data['contract_id'];
            $funding->termin_name = $data['termin_name'];
            $funding->amount = $data['amount'];
            $funding->disbursement_date = $data['disbursement_date'];
            $funding->status = 'pending';
            
            if (isset($data['evidence_path'])) {
                $funding->evidence_path = $data['evidence_path'];
            }

            $funding->save();

            return $funding;
        });
    }
}
