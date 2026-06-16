<?php

namespace App\Http\Controllers;

use App\Models\ReviewerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewerProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $profile = ReviewerProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'skills' => [],
                'total_reviews' => 0,
                'completed_reviews' => 0,
                'bio' => null,
            ]
        );

        return Inertia::render('Profile/ReviewerProfile', [
            'profile' => $profile,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ]);

        $profile = ReviewerProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'skills' => [],
                'total_reviews' => 0,
                'completed_reviews' => 0,
                'bio' => null,
            ]
        );

        $profile->update([
            'skills' => $validated['skills'] ?? [],
            'bio' => $validated['bio'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Reviewer profile updated successfully.');
    }
}
