<?php

namespace App\Http\Controllers;

use App\Models\Article; // This is your primary "Research Output"
use Illuminate\Http\Request;

class PublicOutputController extends Controller
{
    public function show($id)
    {
        /**
         * We use 'with' to get the Journal AND the ScientificField 
         * tied to that journal in one single database query.
         */
        $article = Article::with(['journal.scientificField'])->findOrFail($id);

        /**
         * Security Check: 
         * Since this is "Public Output," we should only show articles 
         * if the Journal they belong to is actually 'approved'.
         */
        if ($article->journal->approval_status !== 'approved') {
            abort(403, 'This research output is not yet publicly available.');
        }

        return view('public_output.show', compact('article'));
    }
}