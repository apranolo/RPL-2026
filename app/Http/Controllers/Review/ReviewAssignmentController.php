<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ReviewAssignmentController extends Controller
{
    public function extendDue(Request $request)
    {
        $validated = $request->validate([
            'review_assignment_id' => ['required', 'integer', 'exists:review_assignments,id'],
            'due_date' => ['required', 'date_format:Y-m-d'],
        ]);

        $assignment = ReviewAssignment::query()
            ->where('id', (int) $validated['review_assignment_id'])
            ->firstOrFail();

        $assignment->due_date = Carbon::createFromFormat('Y-m-d', $validated['due_date'])->toDateString();
        $assignment->save();

        return redirect()->back()->with('success', 'Due date updated.');
    }
}