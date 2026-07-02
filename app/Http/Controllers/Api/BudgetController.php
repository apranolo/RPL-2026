<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function getStats(Request $request)
    {
        $totalBudget = 100000000;
        $usedBudget = 45000000;
        $remainingBudget = $totalBudget - $usedBudget;
        
        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalBudget,
                'used' => $usedBudget,
                'remaining' => $remainingBudget,
                'percentage_used' => round(($usedBudget / $totalBudget) * 100, 2),
                'chart_data' => [
                    'labels' => ['Digunakan', 'Sisa'],
                    'values' => [$usedBudget, $remainingBudget],
                    'colors' => ['#ef4444', '#22c55e']
                ]
            ],
            'message' => 'Budget stats retrieved successfully'
        ]);
    }
}
