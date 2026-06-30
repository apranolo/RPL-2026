<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ScholarService;
use Inertia\Inertia;

class CitationController extends Controller
{
    /**
     * Display the list of authors.
     *
     * @param ScholarService $scholar
     * @return \Inertia\Response
     */
    public function index(ScholarService $scholar)
    {
        return Inertia::render('Profile/Index', [
            'authors' => $scholar->all(),
        ]);
    }

    /**
     * Sync citation data from external source (dummy implementation).
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sync()
    {
        // TODO: implement real sync with Google Scholar / external API
        return back()->with('success', 'Citation data synced successfully.');
    }

    /**
     * Display a single author's citation profile.
     *
     * @param ScholarService $scholar
     * @param int $author
     * @return \Inertia\Response
     */
    public function show(ScholarService $scholar, int $author)
    {
        $profile = $scholar->fetch($author);

        abort_if($profile === null, 404);

        return Inertia::render('Profile/Citation', [
            'profile' => $profile,
        ]);
    }
}
