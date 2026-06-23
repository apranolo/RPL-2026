<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley;
use App\Models\Article;
use App\Http\Requests\StoreGalleyRequest;
use Illuminate\Support\Facades\Auth;

class GalleyController extends Controller
{
    /**
     * STORE GALLEY (FIXED)
     */
    public function store(StoreGalleyRequest $request, $articleId)
    {
        $article = Article::findOrFail($articleId);

        // ================================
        // MULTI-TENANCY CHECK (EDITOR ONLY)
        // ================================
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthorized');
        }

        if ($user->role !== 'editor') {
            abort(403, 'Only editor can upload galley');
        }

        if ($user->journal_id !== $article->journal_id) {
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

            $galley = Galley::create([
                'id_submission' => $articleId,
                'label'         => $request->label,
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
            'issue_id' => 'required|exists:issues,id',
        ]);

        $article = Article::findOrFail($articleId);

        $user = Auth::user();

        // ================================
        // MULTI-TENANCY CHECK
        // ================================
        if (!$user || $user->role !== 'editor') {
            abort(403, 'Only editor can assign article');
        }

        if ($user->journal_id !== $article->journal_id) {
            abort(403, 'Not allowed for this journal');
        }

        $article->update([
            'issue_id' => $request->issue_id,
            'status'   => 'Scheduled',
        ]);

        return back()->with('success', 'Article assigned to issue successfully.');
    }
}