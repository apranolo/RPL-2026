<?php

namespace App\Http\Controllers;

use App\Models\Review;

class ReviewerController extends Controller
{
    public function index()
    {
        $reviews = Review::with([
            'proposal',
            'reviewer',
            'assessmentCriteria'
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tugas reviewer berhasil diambil',
            'data' => $reviews
        ]);
    }
}