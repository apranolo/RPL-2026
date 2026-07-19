<?php

namespace App\Http\Controllers;

use App\Services\ScholarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CitationController extends Controller
{
    /**
     * Display the authenticated user's citation profile
     * (h-index, total citations, and yearly citation trend).
     *
     * @return Response
     */
    public function show()
    {
        return Inertia::render('Profile/Citation', [
            'citationData' => Auth::user()->citation,
        ]);
    }

    /**
     * Sync the authenticated user's citation data from Google Scholar.
     *
     * @return RedirectResponse
     */
    public function sync(ScholarService $scholar)
    {
        $user = Auth::user();
        $stats = $scholar->fetch($user);

        $user->citation()->updateOrCreate([], [
            'h_index' => $stats['h_index'],
            'total_citations' => $stats['total_citations'],
            'yearly_data' => $stats['yearly_data'],
            'last_synced_at' => now(),
        ]);

        return back()->with('success', 'Data sitasi Google Scholar berhasil disinkronkan!');
    }
}
