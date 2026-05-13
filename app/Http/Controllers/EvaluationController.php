<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    public function index()
    {
        return Inertia::render('Evaluation/Index');
    }
}
