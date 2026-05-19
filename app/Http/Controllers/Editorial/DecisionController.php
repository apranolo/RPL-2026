<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\EditorialDecision;

class DecisionController extends Controller
{
    public function history($submissionId)
    {
        // Pastikan model EditorialDecision dibuat oleh Aditya Bintang
        $history = EditorialDecision::with('editor')
            ->where('id_submission', $submissionId)
            ->orderBy('decided_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
