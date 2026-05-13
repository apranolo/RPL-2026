<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    /**
     * Display assessment monitoring page for Super Admin.
     *
     * This is a placeholder page for the assessment monitoring feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Assessments/Index');
    }
}
