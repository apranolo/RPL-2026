<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleyController extends Controller
{

    public function updateMeta(Request $request, Galley $galley)
    {
        $validated = $request->validate([
            'page_from' => 'nullable|integer|min:1',
            'page_to'   => 'nullable|integer|min:1|gte:page_from',
            'doi'       => 'nullable|string|max:255|unique:galleys,doi,' . $galley->id,
        ]);

        $galley->update($validated);

        return redirect()->back()->with('success', 'Metadata artikel berhasil diperbarui.');
    }

    public function setMeta(Galley $galley)
    {
        return Inertia::render('Production/Galley/SetMeta', [
            'galley' => $galley->load('issue'),
        ]);
    }
}