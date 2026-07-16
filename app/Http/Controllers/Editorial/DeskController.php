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

    $user = auth()->user();
    
    if (!$user || (!$user->hasRole('Editor') && !$user->hasRole('Super Admin'))) {
        abort(403, 'Anda tidak memiliki akses untuk melihat naskah ini.');
    }
    
    return Inertia::render('Editorial/Desk/Show', [
        'submission' => $submission
    ]);
}
}