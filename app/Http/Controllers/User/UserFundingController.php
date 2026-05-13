<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserFundingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get contracts for the researcher with funding terms
        $contracts = Contract::forResearcher($user->id)
            ->withFundingTerms()
            ->orderBy('contract_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Calculate aggregate funding information
        $fundingStats = [
            'total_approved' => Contract::forResearcher($user->id)->sum('total_approved_funding'),
            'total_disbursed' => 0,
            'total_remaining' => 0,
            'active_contracts' => Contract::forResearcher($user->id)->active()->count(),
        ];

        // Calculate disbursement from contracts
        foreach ($contracts as $contract) {
            $fundingStats['total_disbursed'] += $contract->getTotalDisbursedAttribute();
            $fundingStats['total_remaining'] += $contract->getRemainingFundingAttribute();
        }

        // Format contracts for response
        $formattedContracts = $contracts->through(function ($contract) {
            return [
                'id' => $contract->id,
                'contract_number' => $contract->contract_number,
                'contract_date' => $contract->contract_date?->format('Y-m-d'),
                'researcher_name' => $contract->researcher?->name,
                'total_approved_funding' => (float) $contract->total_approved_funding,
                'contract_status' => $contract->contract_status,
                'contract_status_label' => $this->getStatusLabel($contract->contract_status),
                'total_disbursed' => (float) $contract->getTotalDisbursedAttribute(),
                'remaining_funding' => (float) $contract->getRemainingFundingAttribute(),
                'disbursement_percentage' => round($contract->getDisbursementPercentageAttribute(), 2),
                'funding_terms' => $contract->fundingTerms->map(function ($term) {
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
                })->toArray(),
                'created_at' => $contract->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Proposal/FundingInfo', [
            'contracts' => $formattedContracts,
            'fundingStats' => $fundingStats,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Get the status label in Indonesian
     */
    private function getStatusLabel(string $status): string
    {
        $statuses = [
            'aktif' => 'Aktif',
            'selesai' => 'Selesai',
            'ditangguhkan' => 'Ditangguhkan',
        ];

        return $statuses[$status] ?? ucfirst($status);
    }
}
