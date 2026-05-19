<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Inertia\Inertia;

class DeskController extends Controller
{
    public function show($id)
    {
        // Pastikan model Submission sudah dibuat oleh M. Dzaky Muayyad
        $submission = Submission::with(['files', 'author', 'editorialDecisions'])->findOrFail($id);

        // Mengirim data ke View via Inertia
        return Inertia::render('Editorial/Desk/Show', [
            'submission' => $submission,
        ]);
    }
}
