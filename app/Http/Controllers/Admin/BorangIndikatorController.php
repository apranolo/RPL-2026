<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BorangIndikatorController extends Controller
{
    /**
     * Display the Borang Indikator page.
     *
     * This is a placeholder page for the Borang Indikator feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/BorangIndikator/Index');
    }
}
