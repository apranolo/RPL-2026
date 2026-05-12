<?php

namespace App\Http\Controllers;

use App\Models\Funding;
use Illuminate\Http\Request;

class FundingLogController extends Controller
{
    public function index(Request $request)
    {
        $fundings = Funding::query()
            ->with([
                'logs', // relasi riwayat perubahan
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat perubahan termin berhasil diambil',
            'data' => $fundings
        ]);
    }
}