<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Submission;
use App\Http\Requests\StoreGalleyRequest;
use Illuminate\Support\Facades\Auth;

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

    /**
     * STORE GALLEY (FIXED)
     */
    public function store(StoreGalleyRequest $request, $articleId)
    {
        $submission = Submission::findOrFail($articleId);

        // ================================
        // MULTI-TENANCY CHECK (EDITOR ONLY)
        // ================================
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthorized');
        }

        if (!$user->hasRole('editor')) {
            abort(403, 'Only editor can upload galley');
        }

        if ($user->journal_id !== $submission->journal_id) {
            abort(403, 'You are not editor of this journal');
        }

        try {
            $file = $request->file('file');

            $filename = time() . '_' . $file->getClientOriginalName();

            $path = $file->storeAs(
                'galleys/' . $articleId,
                $filename,
                'public'
            );

            Galley::create([
                'id_submission' => $articleId,
                'file_extension' => $file->getClientOriginalExtension(),
                'file_path'     => $path,
            ]);

            return back()->with('success', 'Galley uploaded successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * ASSIGN ARTICLE TO ISSUE (FIXED + SAFE)
     */
    public function assignToIssue($articleId, \Illuminate\Http\Request $request)
    {
        $request->validate([
            'id_issue' => 'required|exists:issues,id',
        ]);

        $submission = Submission::findOrFail($articleId);
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        // ================================
        // MULTI-TENANCY CHECK
        // ================================
        if (!$user || !$user->hasRole('editor')) {
            abort(403, 'Only editor can assign article');
        }

        if ($user->journal_id !== $submission->journal_id) {
            abort(403, 'Not allowed for this journal');
        }

        $submission->update([
            'id_issue' => $request->id_issue,
            'status'   => 'Scheduled',
        ]);

        return back()->with('success', 'Article assigned to issue successfully.');
    }
}