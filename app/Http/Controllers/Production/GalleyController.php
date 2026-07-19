<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleyController extends Controller
{
    /**
     * Update the metadata (pages & DOI) of a galley.
     *
     * Accepts separate page_from / page_to fields from the frontend and
     * combines them into the single `pages` string column ("FROM-TO").
     */
    public function updateMeta(Request $request, Galley $galley)
    {
        $validated = $request->validate([
            'page_from' => 'nullable|integer|min:1',
            'page_to'   => 'nullable|integer|min:1|gte:page_from',
            'doi'       => 'nullable|string|max:255|unique:galleys,doi,' . $galley->id,
        ]);

        // Combine page_from and page_to into the single `pages` column
        $from = $validated['page_from'] ?? null;
        $to   = $validated['page_to'] ?? null;

        if ($from !== null && $to !== null) {
            $pages = ($from === $to) ? (string) $from : "{$from}-{$to}";
        } elseif ($from !== null) {
            $pages = (string) $from;
        } elseif ($to !== null) {
            $pages = (string) $to;
        } else {
            $pages = null;
        }

        $galley->update([
            'pages' => $pages,
            'doi'   => $validated['doi'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Metadata artikel berhasil diperbarui.');
    }

    /**
     * Show the SetMeta form for a galley.
     */
    public function setMeta(Galley $galley)
    {
        return Inertia::render('Production/Galley/SetMeta', [
            'galley' => $galley->load('issue'),
        ]);
    }
}