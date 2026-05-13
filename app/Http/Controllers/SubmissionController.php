<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    // STEP 1 - Tampilkan form wizard
    public function step1()
    {
        return view('submission.step1'); 
        // atau Inertia::render(...) kalau pakai React
    }

    // STEP 1 - Simpan data wizard
    public function storeStep1(Request $request)
    {
        $request->validate([
            'journal_id' => 'required',
            'agreement'  => 'required|accepted',
        ]);

        session([
            'step1' => [
                'journal_id' => $request->journal_id,
                'agreement' => true
            ]
        ]);

        return redirect()->route('submission.step2');
    }
}