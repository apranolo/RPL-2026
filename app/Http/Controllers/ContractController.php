<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Funding;
use App\Models\Pembinaan;
use App\Models\University;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContractController extends Controller
{
    /**
     * Display contract management list for Admin Keuangan.
     */
    public function index(Request $request): Response
    {
        $baseQuery = Contract::query()
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $query->search($request->string('search')->toString());
            })
            ->when($request->filled('status'), function (Builder $query) use ($request) {
                $query->byStatus($request->string('status')->toString());
            })
            ->when($request->filled('university_id'), function (Builder $query) use ($request) {
                $query->where('university_id', $request->integer('university_id'));
            })
            ->when($request->filled('pembinaan_id'), function (Builder $query) use ($request) {
                $query->where('pembinaan_id', $request->integer('pembinaan_id'));
            });

        $contractValue = (float) (clone $baseQuery)->sum('contract_value');
        $totalContracts = (clone $baseQuery)->count();
        $disbursedValue = (float) Funding::query()
            ->whereIn('contract_id', (clone $baseQuery)->select('contracts.id'))
            ->disbursed()
            ->sum('amount');

        $contracts = $baseQuery
            ->with([
                'university:id,name,short_name,code',
                'pembinaan:id,name,category',
            ])
            ->withCount('fundings')
            ->withSum('fundings as funding_total', 'amount')
            ->withSum([
                'fundings as disbursed_total' => function (Builder $query) {
                    $query->where('status', Funding::STATUS_DISBURSED);
                },
            ], 'amount')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Contract $contract) {
                $contractValue = (float) $contract->contract_value;
                $disbursedTotal = (float) ($contract->disbursed_total ?? 0);

                return [
                    'id' => $contract->id,
                    'contract_number' => $contract->contract_number,
                    'title' => $contract->title,
                    'status' => $contract->status,
                    'status_label' => $contract->status_label,
                    'status_color' => $contract->status_color,
                    'contract_value' => $contractValue,
                    'funding_total' => (float) ($contract->funding_total ?? 0),
                    'disbursed_total' => $disbursedTotal,
                    'funding_progress' => $contractValue > 0
                        ? min(100, round(($disbursedTotal / $contractValue) * 100, 2))
                        : 0,
                    'fundings_count' => $contract->fundings_count,
                    'start_date' => $contract->start_date?->format('Y-m-d'),
                    'end_date' => $contract->end_date?->format('Y-m-d'),
                    'signed_at' => $contract->signed_at?->format('Y-m-d'),
                    'created_at' => $contract->created_at->format('Y-m-d'),
                    'university' => [
                        'id' => $contract->university->id,
                        'name' => $contract->university->name,
                        'short_name' => $contract->university->short_name,
                        'code' => $contract->university->code,
                    ],
                    'pembinaan' => $contract->pembinaan ? [
                        'id' => $contract->pembinaan->id,
                        'name' => $contract->pembinaan->name,
                        'category' => $contract->pembinaan->category,
                    ] : null,
                ];
            });

        return Inertia::render('Finance/Contract/Index', [
            'contracts' => $contracts,
            'filters' => $request->only(['search', 'status', 'university_id', 'pembinaan_id']),
            'summary' => [
                'total_contracts' => $totalContracts,
                'contract_value' => $contractValue,
                'disbursed_value' => $disbursedValue,
                'outstanding_value' => max($contractValue - $disbursedValue, 0),
            ],
            'universities' => University::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']),
            'pembinaanPrograms' => Pembinaan::query()
                ->orderByDesc('created_at')
                ->get(['id', 'name', 'category']),
            'statusOptions' => collect(Contract::getStatusOptions())
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values(),
        ]);
    }
}
