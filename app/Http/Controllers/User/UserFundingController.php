<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Funding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserFundingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $baseQuery = Contract::query()
            ->whereHas('proposal', fn ($q) => $q->where('user_id', $user->id));

        $fundingStats = [
            'total_approved' => (float) (clone $baseQuery)->sum('contract_value'),
            'total_disbursed' => (float) Funding::query()
                ->whereIn('contract_id', (clone $baseQuery)->select('contracts.id'))
                ->disbursed()
                ->sum('amount'),
            'active_contracts' => (clone $baseQuery)->where('status', Contract::STATUS_ACTIVE)->count(),
        ];
        $fundingStats['total_remaining'] = $fundingStats['total_approved'] - $fundingStats['total_disbursed'];

        $contracts = $baseQuery
            ->with(['proposal:id,judul', 'fundings' => fn ($q) => $q->orderBy('funding_number')])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $formattedContracts = $contracts->through(function (Contract $contract) {
            $totalDisbursed = $contract->fundings->where('status', Funding::STATUS_DISBURSED)->sum('amount');
            $disbursementPercentage = $contract->contract_value > 0
                ? round(($totalDisbursed / $contract->contract_value) * 100, 2)
                : 0;

            return [
                'id' => $contract->id,
                'contract_number' => $contract->contract_number,
                'title' => $contract->title ?? $contract->proposal?->judul,
                'start_date' => $contract->start_date?->format('Y-m-d'),
                'contract_value' => (float) $contract->contract_value,
                'status' => $contract->status,
                'status_label' => Contract::getStatusOptions()[$contract->status] ?? ucfirst($contract->status),
                'total_disbursed' => (float) $totalDisbursed,
                'remaining_funding' => (float) ($contract->contract_value - $totalDisbursed),
                'disbursement_percentage' => $disbursementPercentage,
                'fundings' => $contract->fundings->map(fn (Funding $funding) => [
                    'id' => $funding->id,
                    'funding_number' => $funding->funding_number,
                    'description' => $funding->description,
                    'amount' => (float) $funding->amount,
                    'percentage' => (float) $funding->percentage,
                    'status' => $funding->status,
                    'status_label' => $funding->getStatusLabelAttribute(),
                    'status_color' => $funding->getStatusColorAttribute(),
                    'funding_date' => $funding->funding_date?->format('Y-m-d'),
                    'paid_at' => $funding->paid_at?->format('Y-m-d'),
                    'reference_number' => $funding->reference_number,
                    'proof_document_path' => $funding->proof_document_path,
                    'notes' => $funding->notes,
                ])->values()->toArray(),
                'created_at' => $contract->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Proposal/FundingInfo', [
            'contracts' => $formattedContracts,
            'fundingStats' => $fundingStats,
            'filters' => $request->only(['search']),
        ]);
    }
}
