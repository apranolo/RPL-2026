<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display the Reviewer management page.
     *
     * This is a placeholder page for the Reviewer feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('AdminKampus/Reviewer/Index');
    }
}
