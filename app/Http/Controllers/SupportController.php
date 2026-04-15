<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Display the support page.
     *
     * This is a placeholder page for the Support feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('Support');
    }
}
