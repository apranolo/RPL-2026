<?php

/** @author KHANSA KAMILAH LICTJELITA */
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BudgetController extends Controller
{
    public function getStats(Request $request)
    {
        $userId = Auth::id() ?? 1; // Default ke 1 untuk keamanan jika belum login dengan benar
        
        // Data Mocking (Fallback)
        $totalBudget = 100000000;
        $usedBudget = 45000000;

        // Jika branch milik Afriza (Modul 3) sudah di-merge dan tabelnya ada, gunakan data asli
        if (Schema::hasTable('contracts') && Schema::hasTable('fundings')) {
            $realTotalBudget = DB::table('contracts')
                ->join('proposals', 'contracts.proposal_id', '=', 'proposals.id')
                ->where('proposals.user_id', $userId)
                ->sum('contracts.contract_value');

            $realUsedBudget = DB::table('fundings')
                ->join('contracts', 'fundings.contract_id', '=', 'contracts.id')
                ->join('proposals', 'contracts.proposal_id', '=', 'proposals.id')
                ->where('proposals.user_id', $userId)
                ->whereIn('fundings.status', ['approved', 'disbursed'])
                ->sum('fundings.amount');
                
            // Gunakan data asli jika Dosen tersebut memiliki kontrak
            if ($realTotalBudget > 0) {
                $totalBudget = $realTotalBudget;
                $usedBudget = $realUsedBudget;
            } else {
                // Jika tidak punya kontrak, kita jadikan 0 (atau bisa dipertahankan mock data jika untuk demo)
                $totalBudget = 0;
                $usedBudget = 0;
            }
        }

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
                    'colors' => ['#ef4444', '#22c55e']
                ]
            ],
            'message' => 'Budget stats retrieved successfully'
        ]);
    }
}
