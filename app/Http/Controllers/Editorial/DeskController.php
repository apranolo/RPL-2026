<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Inertia\Inertia;

class DeskController extends Controller
{
    public function show($id)
    {
        
        $submission = Submission::with(['files', 'author', 'editorialDecisions'])->findOrFail($id);

        
        return Inertia::render('Editorial/Desk/Show', [
            'submission' => $submission
        ]);
    }
}