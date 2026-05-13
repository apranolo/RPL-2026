<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EditorialDiscussion;
use App\Models\Submission;

class EditorialDiscussionController extends Controller
{
    /**
     * Menampilkan diskusi berdasarkan submission
     */
    public function index($submissionId)
    {
        $submission = Submission::findOrFail($submissionId);

        $discussions = EditorialDiscussion::with('user')
            ->where('submission_id', $submissionId)
            ->latest()
            ->get();

        return response()->json([
            'submission' => $submission,
            'discussions' => $discussions,
        ]);
    }

    /**
     * Menyimpan pesan diskusi baru
     */
    public function store(Request $request, $submissionId)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $discussion = EditorialDiscussion::create([
            'submission_id' => $submissionId,
            'user_id' => auth()->id(),
            'message' => $validated['message'],
        ]);

        return response()->json([
            'message' => 'Diskusi berhasil ditambahkan',
            'data' => $discussion,
        ], 201);
    }
}