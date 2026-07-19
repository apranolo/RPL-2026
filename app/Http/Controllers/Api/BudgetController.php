<?php

/** @author KHANSA KAMILAH LICTJELITA */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function getStats(Request $request)
    {
        $userId = Auth::id();

        $totalBudget = DB::table('contracts')
            ->join('proposals', 'contracts.proposal_id', '=', 'proposals.id')
            ->where('proposals.user_id', $userId)
            ->sum('contracts.contract_value');

        $usedBudget = DB::table('fundings')
            ->join('contracts', 'fundings.contract_id', '=', 'contracts.id')
            ->join('proposals', 'contracts.proposal_id', '=', 'proposals.id')
            ->where('proposals.user_id', $userId)
            ->whereIn('fundings.status', ['approved', 'disbursed'])
            ->sum('fundings.amount');

        $remainingBudget = $totalBudget - $usedBudget;
        $percentageUsed = $totalBudget > 0 ? round(($usedBudget / $totalBudget) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalBudget,
                'used' => $usedBudget,
                'remaining' => $remainingBudget,
                'percentage_used' => $percentageUsed,
                'chart_data' => [
                    'labels' => ['Digunakan', 'Sisa'],
                    'values' => [$usedBudget, $remainingBudget],
                    'colors' => ['#ef4444', '#22c55e'],
                ],
            ],
            'message' => 'Budget stats retrieved successfully',
        ]);
    }
}
