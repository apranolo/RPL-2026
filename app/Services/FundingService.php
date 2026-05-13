<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\FundingTerm;

class FundingService
{
    /**
     * Calculate funding statistics for a researcher
     */
    public static function getResearcherFundingStats(int $researcherId): array
    {
        $contracts = Contract::forResearcher($researcherId)
            ->with(['fundingTerms'])
            ->get();

        $totalApproved = 0;
        $totalDisbursed = 0;
        $activeContracts = 0;

        foreach ($contracts as $contract) {
            // Count active contracts
            if ($contract->contract_status === 'aktif') {
                $activeContracts++;
            }

            // Calculate totals
            $totalApproved += $contract->total_approved_funding;
            
            foreach ($contract->fundingTerms as $term) {
                if ($term->status === 'cair') {
                    $totalDisbursed += $term->nominal;
                }
            }
        }

        return [
            'total_approved' => $totalApproved,
            'total_disbursed' => $totalDisbursed,
            'total_remaining' => $totalApproved - $totalDisbursed,
            'active_contracts' => $activeContracts,
            'disbursement_percentage' => $totalApproved > 0 
                ? round(($totalDisbursed / $totalApproved) * 100, 2) 
                : 0,
        ];
    }

    /**
     * Validate if funding term percentages equal 100%
     */
    public static function validateTermPercentages(int $contractId): bool
    {
        $totalPercentage = FundingTerm::where('contract_id', $contractId)
            ->whereNull('deleted_at')
            ->sum('percentage');

        return abs($totalPercentage - 100) < 0.01; // Allow for floating point errors
    }

    /**
     * Get disbursement rate for a contract
     */
    public static function getContractDisbursementRate(Contract $contract): float
    {
        if ($contract->total_approved_funding <= 0) {
            return 0;
        }

        $totalDisbursed = $contract->fundingTerms()
            ->where('status', 'cair')
            ->sum('nominal');

        return round(($totalDisbursed / $contract->total_approved_funding) * 100, 2);
    }

    /**
     * Get pending funding terms for a contract
     */
    public static function getPendingTerms(int $contractId): float
    {
        return FundingTerm::where('contract_id', $contractId)
            ->where('status', 'menunggu')
            ->sum('nominal');
    }

    /**
     * Check if next term can be disbursed
     * (considering if previous terms are completed)
     */
    public static function canDisburseTerm(FundingTerm $term): bool
    {
        if ($term->status !== 'menunggu') {
            return false;
        }

        // Check if all previous terms are disbursed
        $previousTerms = FundingTerm::where('contract_id', $term->contract_id)
            ->where('order', '<', $term->order)
            ->whereNull('deleted_at')
            ->get();

        foreach ($previousTerms as $prevTerm) {
            if ($prevTerm->status !== 'cair') {
                return false;
            }
        }

        return true;
    }

    /**
     * Format funding data for API response
     */
    public static function formatContractResponse(Contract $contract): array
    {
        return [
            'id' => $contract->id,
            'contract_number' => $contract->contract_number,
            'contract_date' => $contract->contract_date?->format('Y-m-d'),
            'researcher_name' => $contract->researcher?->name,
            'total_approved_funding' => (float) $contract->total_approved_funding,
            'contract_status' => $contract->contract_status,
            'contract_status_label' => self::getStatusLabel($contract->contract_status),
            'total_disbursed' => (float) $contract->fundingTerms()
                ->where('status', 'cair')
                ->sum('nominal'),
            'remaining_funding' => (float) self::getRemainingFunding($contract),
            'disbursement_percentage' => round(
                self::getContractDisbursementRate($contract),
                2
            ),
            'funding_terms' => $contract->fundingTerms->map(function ($term) {
                return self::formatTermResponse($term);
            })->toArray(),
        ];
    }

    /**
     * Format funding term data for API response
     */
    public static function formatTermResponse(FundingTerm $term): array
    {
        return [
            'id' => $term->id,
            'term_name' => $term->term_name,
            'order' => $term->order,
            'percentage' => (float) $term->percentage,
            'nominal' => (float) $term->nominal,
            'status' => $term->status,
            'status_label' => $term->getStatusLabelAttribute(),
            'status_color' => $term->getStatusColorAttribute(),
            'disbursement_date' => $term->disbursement_date?->format('Y-m-d'),
            'receipt_number' => $term->receipt_number,
            'receipt_file' => $term->receipt_file,
            'notes' => $term->notes,
        ];
    }

    /**
     * Get human-readable status label
     */
    public static function getStatusLabel(string $status): string
    {
        $statuses = [
            'aktif' => 'Aktif',
            'selesai' => 'Selesai',
            'ditangguhkan' => 'Ditangguhkan',
        ];

        return $statuses[$status] ?? ucfirst($status);
    }

    /**
     * Calculate remaining funding for a contract
     */
    private static function getRemainingFunding(Contract $contract): float
    {
        $totalDisbursed = $contract->fundingTerms()
            ->where('status', 'cair')
            ->sum('nominal');

        return $contract->total_approved_funding - $totalDisbursed;
    }
}
