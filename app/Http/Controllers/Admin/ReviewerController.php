<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display a listing of Reviewers.
     *
     * v1.1 feature - Reviewer management placeholder
     */
    public function index(): Response
    {
        // Only Super Admin can access
        $this->authorize('manage-users');

        return Inertia::render('Admin/Reviewers/Index');
    }
}
