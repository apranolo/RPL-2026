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
        $overallStats = $this->homeService->getOverallStats();
        $scientificFields = $this->homeService->getTopScientificFields();

        return Inertia::render('welcome', [
            'featuredJournals' => $featuredJournals,
            'totalUniversities' => $overallStats['totalUniversities'],
            'totalJournals' => $overallStats['totalJournals'],
            'totalArticles' => $overallStats['totalArticles'],
            'scientificFields' => $scientificFields,
        ]);
    }
}
