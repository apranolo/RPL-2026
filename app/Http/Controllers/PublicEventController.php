<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Display a listing of upcoming agendas/events.
     */
    public function index(Request $request): Response
    {
        $query = Agenda::query()
            ->withCount('registrations')
            ->with('university:id,name,logo_url')
            ->active() // Only active events
            ->where('date_start', '>=', now()->toDateString()) // Upcoming events
            ->orderBy('date_start', 'asc');

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $agendas = $query->paginate(12)
            ->withQueryString()
            ->through(fn ($agenda) => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'slug' => $agenda->slug,
                'type' => $agenda->type,
                'description' => substr(strip_tags($agenda->description), 0, 150).'...',
                'thumbnail_url' => $agenda->thumbnail_url,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'time_start' => $agenda->time_start?->format('H:i'),
                'location_type' => $agenda->location_type,
                'location_venue' => $agenda->location_venue,
                'price' => $agenda->price,
                'quota' => $agenda->quota,
                'registered_count' => $agenda->registrations_count ?? 0,
                'is_featured' => $agenda->is_featured,
                'university' => $agenda->university ? [
                    'name' => $agenda->university->name,
                    'logo_url' => $agenda->university->logo_url,
                ] : null,
            ]);

        // Need the options to populate the filter dropdown
        $types = Agenda::active()->distinct()->pluck('type');

        return Inertia::render('Public/Events/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['search', 'type']),
            'types' => $types,
        ]);
    }

    /**
     * Display the specified agenda/event.
     */
    public function show(string $slug): Response
    {
        $agenda = Agenda::with('university:id,name,short_name,logo_url,website')
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Public/Events/Show', [
            'agenda' => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'type' => $agenda->type,
                'description' => $agenda->description,
                'thumbnail_url' => $agenda->thumbnail_url,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'date_end' => $agenda->date_end?->format('Y-m-d'),
                'time_start' => $agenda->time_start?->format('H:i'),
                'time_end' => $agenda->time_end?->format('H:i'),
                'location_type' => $agenda->location_type,
                'location_venue' => $agenda->location_venue,
                'location_link' => $agenda->location_link,
                'registration_link' => $agenda->registration_link,
                'price' => $agenda->price,
                'contact_person_name' => $agenda->contact_person_name,
                'contact_person_phone' => $agenda->contact_person_phone,
                'contact_person_email' => $agenda->contact_person_email,
                'is_featured' => $agenda->is_featured,
                'university' => $agenda->university ? [
                    'name' => $agenda->university->name,
                    'short_name' => $agenda->university->short_name,
                    'logo_url' => $agenda->university->logo_url,
                    'website_url' => $agenda->university->website,
                ] : null,
            ],
        ]);
    }
}
