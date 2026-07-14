<?php

namespace App\Http\Controllers;

use App\Models\AuthorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ProfileController
 *
 * Manages author profile operations.
 */
class ProfileController extends Controller
{
    /**
     * Display the authenticated author's profile.
     *
     * @route GET /profile/author
     *
     * @features Display author profile information
     */
    public function show(): Response
    {
        $user = auth()->user();

        // Load author profile relationship
        $user->load('authorProfile');

        return Inertia::render('Profile/AuthorProfile', [
            'profile' => $user->authorProfile,
        ]);
    }

    /**
     * Store or update the authenticated author's profile.
     *
     * @route POST /profile/author
     *
     * @features Create or update author profile
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate incoming request
        $validated = $request->validate([
            'orcid' => ['nullable', 'string', 'max:255'],
            'affiliation' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        // Create new profile or update existing profile
        AuthorProfile::updateOrCreate(
            [
                'user_id' => auth()->id(),
            ],
            $validated
        );

        return back()->with('success', 'Author profile updated successfully.');
    }
}