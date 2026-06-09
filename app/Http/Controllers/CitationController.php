<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ScholarService;
use Inertia\Inertia;

class CitationController extends Controller
{
    /**
     * Display the citation profile.
     *
     * @param ScholarService $scholar
     * @return \Inertia\Response
     */
    public function index(ScholarService $scholar)
    {
        return Inertia::render('Profile/Citation', [
            'profile' => $scholar->fetch()
        ]);
    }

    /**
     * Sync citation data from Google Scholar.
     *
     * @param ScholarService $scholar
     * @return \Illuminate\Http\JsonResponse
     */
    public function sync(ScholarService $scholar)
    {
        $data = $scholar->fetch();

        return response()->json($data);
    }
}