<?php

namespace App\Http\Controllers;

use App\Models\ReviewerAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    // Task 10 - index(): daftar proposal yang perlu dievaluasi
    public function index()
    {
        $assignments = ReviewerAssignment::with(['registration.journal', 'registration.pembinaan'])
            ->where('reviewer_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Reviewer/Evaluation/Index', [
            'assignments' => $assignments,
        ]);
    }
}
