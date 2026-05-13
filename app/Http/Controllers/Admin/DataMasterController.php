<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DataMasterController extends Controller
{
    /**
     * Display the Data Master page.
     *
     * This is a placeholder page for the Data Master feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/DataMaster/Index');
    }
}
