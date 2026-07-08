<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Funding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceReportController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->get('year', now()->year);
        $scheme = (string) $request->get('scheme', 'all');

        $summary = $this->summary($year, $scheme);

        return Inertia::render('Finance/Report/Index', [
            'summary' => $summary,
            'filters' => [
                'year' => $year,
                'scheme' => $scheme,
            ],
        ]);
    }

    public function summary($year = null, $scheme = 'all')
    {
        $year = $year ? (int) $year : now()->year;
        $scheme = $scheme ?? 'all';

        $contracts = Contract::query()
            ->with(['university:id,name,short_name,code'])
            ->when($year, function (Builder $query) use ($year) {
                $query->where(function (Builder $subQuery) use ($year) {
                    $subQuery->whereYear('signed_at', $year)
                        ->orWhereYear('start_date', $year)
                        ->orWhereYear('created_at', $year);
                });
            })
            ->when($scheme !== 'all', function (Builder $query) use ($scheme) {
                $query->where('status', $scheme);
            })
            ->withSum([
                'fundings as disbursed_total' => function (Builder $query) {
                    $query->where('status', Funding::STATUS_DISBURSED);
                },
            ], 'amount')
            ->withSum('fundings as funding_total', 'amount')
            ->get();

        $totalContractValue = (float) $contracts->sum(fn (Contract $contract) => (float) $contract->contract_value);
        $totalDisbursed = (float) $contracts->sum(fn (Contract $contract) => (float) ($contract->disbursed_total ?? 0));
        $remainingBalance = max($totalContractValue - $totalDisbursed, 0);

        return [
            'total_contracts' => $contracts->count(),
            'total_contract_value' => $totalContractValue,
            'total_disbursed' => $totalDisbursed,
            'remaining_balance' => $remainingBalance,
            'year' => $year,
            'scheme' => $scheme,
            'data' => $contracts->map(function (Contract $contract) {
                $contractValue = (float) $contract->contract_value;
                $disbursedTotal = (float) ($contract->disbursed_total ?? 0);

                return [
                    'id' => $contract->id,
                    'contract_title' => $contract->title ?? 'N/A',
                    'university' => $contract->university?->name ?? 'N/A',
                    'contract_value' => $contractValue,
                    'disbursed_total' => $disbursedTotal,
                    'remaining_balance' => max($contractValue - $disbursedTotal, 0),
                    'status' => $contract->status,
                    'status_label' => Contract::getStatusOptions()[$contract->status] ?? $contract->status,
                    'signed_at' => $contract->signed_at?->format('Y-m-d'),
                ];
            })->values(),
        ];
    }

    public function filter(Request $request)
    {
        $year = (int) $request->get('year', now()->year);
        $scheme = (string) $request->get('scheme', 'all');

        return response()->json($this->summary($year, $scheme));
    }
}
