<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TopResearchController extends Controller
{
    /**
     * Mengambil top 5 penelitian teraktif berdasarkan jumlah luaran (research_outputs).
     * Entitas "penelitian" dalam sistem ini diwakili oleh model Proposal.
     */
    public function getTop(): JsonResponse
    {
        $universityId = Auth::user()->university_id;

        $topResearch = Proposal::select(
            'proposals.id',
            'proposals.title',
            DB::raw('COUNT(research_outputs.id) as citations')
        )
            ->join('users', 'proposals.user_id', '=', 'users.id')
            ->leftJoin('contracts', 'proposals.id', '=', 'contracts.proposal_id')
            ->leftJoin('research_outputs', 'contracts.id', '=', 'research_outputs.contract_id')
            ->where('users.university_id', $universityId)
            ->groupBy('proposals.id', 'proposals.title')
            ->orderByDesc('citations')
            ->limit(5)
            ->get();

        return response()->json($topResearch);
    }
}
