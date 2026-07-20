<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\EditorialDecision;

class DecisionController extends Controller
{
    public function history($submissionId)
    {
        $history = EditorialDecision::with('editor')
            ->where('submission_id', $submissionId)
            ->orderBy('decided_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
