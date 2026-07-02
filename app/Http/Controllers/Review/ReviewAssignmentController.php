<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    public function extendDue(Request $request)
    {
        return response()->json([
            'message' => 'extendDue belum diimplementasikan',
        ]);
    }
}