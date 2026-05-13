<?php

namespace App\Http\Controllers;

use App\Models\ReviewerAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Daftar proposal yang perlu dievaluasi oleh reviewer yang sedang login.
     */
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