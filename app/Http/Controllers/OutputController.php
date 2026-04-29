<?php

namespace App\Http\Controllers;

use App\Models\ResearchOutput;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OutputController extends Controller
{
    public function index()
    {
        $outputs = ResearchOutput::with('user')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Output/Index', [
            'outputs' => $outputs,
        ]);
    }
}
