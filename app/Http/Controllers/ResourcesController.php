<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ResourcesController extends Controller
{
    /**
     * Display the resources page.
     *
     * This is a placeholder page for the Resources feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('Resources');
    }
}
