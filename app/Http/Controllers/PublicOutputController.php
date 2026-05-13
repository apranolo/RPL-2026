<?php

namespace App\Http\Controllers;

use App\Models\Article; // This is your primary "Research Output"
use Illuminate\Http\Request;
use Inertia\Inertia;

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

    public function search(Request $request)
    {
        // 1. Get the search term from the URL (?q=searchterm)
        $query = $request->input('q');

        // 2. Build the search query
        $results = Article::query()
            ->with(['journal']) // Eager load the journal to show its name in the list
            ->whereHas('journal', function($q) {
                $q->where('approval_status', 'approved'); // Only show public/approved articles
            })
            ->when($query, function ($q, $search) {
                $q->where(function($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                          ->orWhere('abstract', 'like', "%{$search}%")
                          ->orWhereJsonContains('keywords', $search)
                          ->orWhereJsonContains('authors', $search);
                });
            })
            ->orderBy('publication_date', 'desc')
            ->paginate(12)
            ->withQueryString(); // Keeps the search term in the pagination links

        // This tells Inertia to look for a React file at: 
        // resources/js/pages/PublicOutput/Index.tsx
        return Inertia::render('PublicOutput/Index', [
            'articles' => $articles,
            'filters' => $request->only(['q']),
        ]);
    }
}