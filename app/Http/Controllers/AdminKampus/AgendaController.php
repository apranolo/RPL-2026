<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Agenda::class);

        $authUser = $request->user();

        abort_if(
            is_null($authUser->university_id),
            403,
            'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
        );

        $query = Agenda::query()
            ->forUniversity($authUser->university_id)
            ->with('user:id,name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $agendas = $query->orderBy('date_start', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($agenda) => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'type' => $agenda->type,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'is_active' => $agenda->is_active,
                'is_featured' => $agenda->is_featured,
                'created_at' => $agenda->created_at->format('Y-m-d H:i:s'),
                'creator' => $agenda->user ? $agenda->user->name : null,
            ]);

        return Inertia::render('AdminKampus/Events/Index', [
            'events' => $agendas,
            'filters' => $request->only(['search', 'is_active']),
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Agenda::class);
        $authUser = $request->user();

        return Inertia::render('AdminKampus/Events/Create', [
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
            'agendaTypes' => ['Seminar', 'Workshop', 'Conference', 'Call for Papers', 'Training', 'Other'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Agenda::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048', // max 2MB
            'date_start' => 'required|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'nullable|date_format:H:i',
            'location_type' => 'required|in:Online,Offline,Hybrid',
            'location_venue' => 'nullable|string|max:255',
            'location_link' => 'nullable|url|max:255',
            'registration_link' => 'nullable|url|max:255',
            'price' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:0',
            'contact_person_name' => 'nullable|string|max:100',
            'contact_person_phone' => 'nullable|string|max:50',
            'contact_person_email' => 'nullable|email|max:100',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('agendas', 'public');
            $validated['thumbnail'] = $path;
        }

        $validated['university_id'] = $request->user()->university_id;
        $validated['user_id'] = $request->user()->id;
        $validated['price'] = $validated['price'] ?? 0;
        $validated['quota'] = $validated['quota'] ?? 0;

        Agenda::create($validated);

        return redirect()->route('admin-kampus.events.index')
            ->with('success', 'Agenda created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Agenda $event): Response
    {
        $this->authorize('update', $event);
        $authUser = $request->user();

        return Inertia::render('AdminKampus/Events/Edit', [
            'agenda' => [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type,
                'description' => $event->description,
                'thumbnail_url' => $event->thumbnail_url,
                'date_start' => $event->date_start?->format('Y-m-d'),
                'date_end' => $event->date_end?->format('Y-m-d'),
                'time_start' => $event->time_start?->format('H:i'),
                'time_end' => $event->time_end?->format('H:i'),
                'location_type' => $event->location_type,
                'location_venue' => $event->location_venue,
                'location_link' => $event->location_link,
                'registration_link' => $event->registration_link,
                'price' => $event->price,
                'quota' => $event->quota,
                'contact_person_name' => $event->contact_person_name,
                'contact_person_phone' => $event->contact_person_phone,
                'contact_person_email' => $event->contact_person_email,
                'is_active' => $event->is_active,
                'is_featured' => $event->is_featured,
            ],
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
            'agendaTypes' => ['Seminar', 'Workshop', 'Conference', 'Call for Papers', 'Training', 'Other'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Agenda $event): RedirectResponse
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'date_start' => 'required|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'nullable|date_format:H:i',
            'location_type' => 'required|in:Online,Offline,Hybrid',
            'location_venue' => 'nullable|string|max:255',
            'location_link' => 'nullable|url|max:255',
            'registration_link' => 'nullable|url|max:255',
            'price' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:0',
            'contact_person_name' => 'nullable|string|max:100',
            'contact_person_phone' => 'nullable|string|max:50',
            'contact_person_email' => 'nullable|email|max:100',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($event->thumbnail) {
                Storage::disk('public')->delete($event->thumbnail);
            }
            $path = $request->file('thumbnail')->store('agendas', 'public');
            $validated['thumbnail'] = $path;
        }

        $validated['price'] = $validated['price'] ?? 0;
        $validated['quota'] = $validated['quota'] ?? 0;

        $event->update($validated);

        return redirect()->route('admin-kampus.events.index')
            ->with('success', 'Agenda updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agenda $event): RedirectResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()->route('admin-kampus.events.index')
            ->with('success', 'Agenda deleted successfully.');
    }
}
