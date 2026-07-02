<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TopResearchCtrl extends Controller
{
    /**
     * Mengambil top 5 penelitian teraktif berdasarkan jumlah luaran (research_outputs).
     * Entitas "penelitian" dalam sistem ini diwakili oleh model Proposal.
     *
     * @return JsonResponse
     */
    public function getTop(): JsonResponse
    {
        $topResearch = Proposal::select(
                'proposals.id',
                'proposals.title',
                DB::raw('COUNT(research_outputs.id) as citations')
            )
            ->leftJoin('research_outputs', 'proposals.id', '=', 'research_outputs.proposal_id')
            ->groupBy('proposals.id', 'proposals.title')
            ->orderByDesc('citations')
            ->limit(5)
            ->get();

        return response()->json($topResearch);
    }
}
