<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    // Task 10 - index(): daftar proposal yang perlu dievaluasi
    public function index()
    {
        $tasks = Review::query()
            ->where('reviewer_id', Auth::id())
            ->with(['proposal', 'assessmentCriteria'])
            ->latest('created_at')
            ->paginate(10);

        return Inertia::render('Reviewer/index', [
            'tasks' => $tasks,
        ]);
    }
}
