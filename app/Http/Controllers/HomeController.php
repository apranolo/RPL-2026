<?php

namespace App\Http\Controllers;

use App\Services\PublicHomeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected PublicHomeService $homeService
    ) {}

    /**
     * Display the welcome page.
     */
    public function index(Request $request): Response
    {
        $featuredJournals = $this->homeService->getFeaturedJournals();
        $sintaStats = $this->homeService->getSintaStats();
        $overallStats = $this->homeService->getOverallStats();
        $scientificFields = $this->homeService->getTopScientificFields();

        return Inertia::render('welcome', [
            'featuredJournals' => $featuredJournals,
            'sintaStats' => $sintaStats,
            'totalUniversities' => $overallStats['totalUniversities'],
            'totalJournals' => $overallStats['totalJournals'],
            'scientificFields' => $scientificFields,
        ]);
    }
}
