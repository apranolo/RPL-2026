<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(Request $request): Response
    {
        $this->authorize('manage-announcements');

        $query = Announcement::query()
            ->with(['university', 'user'])
            ->latest('created_at');

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('content', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Filter by University
        if ($request->has('university_id') && $request->university_id) {
            $query->where('university_id', $request->university_id);
        }

        // Filter by Active Status
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by Published Status
        if ($request->has('is_published') && $request->is_published !== null) {
            $isPublished = $request->boolean('is_published');
            if ($isPublished) {
                $query->published();
            } else {
                $query->where(function ($q) {
                    $q->whereNull('published_at')
                        ->orWhere('published_at', '>', now());
                });
            }
        }

        // Get announcements with pagination
        $announcements = $query
            ->paginate(10)
            ->withQueryString()
            ->through(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'slug' => $announcement->slug,
                    'description' => $announcement->description,
                    'is_active' => $announcement->is_active,
                    'is_featured' => $announcement->is_featured,
                    'published_at' => $announcement->published_at?->format('Y-m-d H:i'),
                    'expires_at' => $announcement->expires_at?->format('Y-m-d H:i'),
                    'university' => $announcement->university ? [
                        'id' => $announcement->university->id,
                        'name' => $announcement->university->name,
                        'short_name' => $announcement->university->short_name,
                    ] : null,
                    'user' => $announcement->user ? [
                        'id' => $announcement->user->id,
                        'name' => $announcement->user->name,
                    ] : null,
                    'created_at' => $announcement->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get all universities for filter dropdown (with cache)
        $universities = Cache::remember('universities.active.list', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']);
        });

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'universities' => $universities,
            'filters' => $request->only(['search', 'university_id', 'is_active', 'is_published']),
        ]);
    }

    /**
     * Show the form for creating a new announcement.
     */
    public function create(): Response
    {
        $this->authorize('manage-announcements');

        // Get all active universities (with cache)
        $universities = Cache::remember('universities.active.list', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']);
        });

        return Inertia::render('Admin/Announcements/Create', [
            'universities' => $universities,
        ]);
    }

    /**
     * Store a newly created announcement in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('manage-announcements');

        // Validate request
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'published_at' => 'nullable|date_format:Y-m-d H:i',
            'expires_at' => 'nullable|date_format:Y-m-d H:i|after_or_equal:published_at',
            'is_active' => 'required|boolean',
            'is_featured' => 'required|boolean',
        ]);

        // Handle thumbnail upload
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store(
                'announcements',
                'public'
            );
        }

        // Create announcement
        $announcement = Announcement::create([
            'university_id' => $validated['university_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'description' => $validated['description'] ?? null,
            'thumbnail' => $thumbnailPath,
            'published_at' => ! empty($validated['published_at']) ? now()->parse($validated['published_at']) : null,
            'expires_at' => ! empty($validated['expires_at']) ? now()->parse($validated['expires_at']) : null,
            'is_active' => $validated['is_active'],
            'is_featured' => $validated['is_featured'],
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement): Response
    {
        $this->authorize('manage-announcements');

        $announcement->load(['university', 'user']);

        return Inertia::render('Admin/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'content' => $announcement->content,
                'description' => $announcement->description,
                'thumbnail' => $announcement->thumbnail,
                'is_active' => $announcement->is_active,
                'is_featured' => $announcement->is_featured,
                'published_at' => $announcement->published_at?->format('Y-m-d H:i'),
                'expires_at' => $announcement->expires_at?->format('Y-m-d H:i'),
                'university' => $announcement->university ? [
                    'id' => $announcement->university->id,
                    'name' => $announcement->university->name,
                    'short_name' => $announcement->university->short_name,
                ] : null,
                'user' => $announcement->user ? [
                    'id' => $announcement->user->id,
                    'name' => $announcement->user->name,
                    'email' => $announcement->user->email,
                ] : null,
                'created_at' => $announcement->created_at->format('Y-m-d H:i'),
                'updated_at' => $announcement->updated_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified announcement.
     */
    public function edit(Announcement $announcement): Response
    {
        $this->authorize('manage-announcements');

        $announcement->load(['university']);

        // Get all active universities
        $universities = University::active()
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => [
                'id' => $announcement->id,
                'university_id' => $announcement->university_id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'description' => $announcement->description,
                'thumbnail' => $announcement->thumbnail,
                'is_active' => $announcement->is_active,
                'is_featured' => $announcement->is_featured,
                'published_at' => $announcement->published_at?->format('Y-m-d H:i'),
                'expires_at' => $announcement->expires_at?->format('Y-m-d H:i'),
            ],
            'universities' => $universities,
        ]);
    }

    /**
     * Update the specified announcement in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $this->authorize('manage-announcements');

        // Validate request
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'published_at' => 'nullable|date_format:Y-m-d H:i',
            'expires_at' => 'nullable|date_format:Y-m-d H:i|after_or_equal:published_at',
            'is_active' => 'required|boolean',
            'is_featured' => 'required|boolean',
        ]);

        // Handle thumbnail upload
        $thumbnailPath = $announcement->thumbnail;
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($announcement->thumbnail && \Illuminate\Support\Facades\Storage::disk('public')->exists($announcement->thumbnail)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($announcement->thumbnail);
            }

            $thumbnailPath = $request->file('thumbnail')->store(
                'announcements',
                'public'
            );
        }

        // Update announcement
        $announcement->update([
            'university_id' => $validated['university_id'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'description' => $validated['description'] ?? null,
            'thumbnail' => $thumbnailPath,
            'published_at' => ! empty($validated['published_at']) ? now()->parse($validated['published_at']) : null,
            'expires_at' => ! empty($validated['expires_at']) ? now()->parse($validated['expires_at']) : null,
            'is_active' => $validated['is_active'],
            'is_featured' => $validated['is_featured'],
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }

    /**
     * Remove the specified announcement from storage.
     */
    public function destroy(Request $request, Announcement $announcement)
    {
        $this->authorize('manage-announcements');

        // Delete thumbnail if exists
        if ($announcement->thumbnail && \Illuminate\Support\Facades\Storage::disk('public')->exists($announcement->thumbnail)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($announcement->thumbnail);
        }

        // Soft delete announcement
        $announcement->delete();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }

    /**
     * Toggle featured status of the announcement.
     */
    public function toggleFeatured(Request $request, Announcement $announcement)
    {
        $this->authorize('manage-announcements');

        $announcement->update([
            'is_featured' => ! $announcement->is_featured,
        ]);

        $status = $announcement->is_featured ? 'featured' : 'unfeatured';

        return back()->with('success', "Announcement {$status} successfully.");
    }

    /**
     * Toggle active status of the announcement.
     */
    public function toggleActive(Request $request, Announcement $announcement)
    {
        $this->authorize('manage-announcements');

        $announcement->update([
            'is_active' => ! $announcement->is_active,
        ]);

        $status = $announcement->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Announcement {$status} successfully.");
    }
}
