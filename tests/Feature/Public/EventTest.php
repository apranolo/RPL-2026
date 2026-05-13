<?php

use App\Models\Agenda;
use App\Models\University;

it('displays public events list for active upcoming events', function () {
    $university = University::factory()->create();

    // Active upcoming event (Should be visible)
    Agenda::factory()->create([
        'university_id' => $university->id,
        'title' => 'Upcoming Active Event',
        'is_active' => true,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    // Active past event (Should NOT be visible)
    Agenda::factory()->create([
        'university_id' => $university->id,
        'title' => 'Past Active Event',
        'is_active' => true,
        'date_start' => now()->subDays(5)->format('Y-m-d'),
    ]);

    // Inactive upcoming event (Should NOT be visible)
    Agenda::factory()->create([
        'university_id' => $university->id,
        'title' => 'Upcoming Inactive Event',
        'is_active' => false,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    $response = $this->get(route('events.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Events/Index')
        ->has('agendas.data', 1)
        ->where('agendas.data.0.title', 'Upcoming Active Event')
    );
});

it('filters events by search title and type', function () {
    Agenda::factory()->create([
        'title' => 'React Setup Seminar',
        'type' => 'Seminar',
        'is_active' => true,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    Agenda::factory()->create([
        'title' => 'Laravel Deep Dive',
        'type' => 'Workshop',
        'is_active' => true,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    // Search by title
    $responseSearch = $this->get(route('events.index', ['search' => 'React']));
    $responseSearch->assertInertia(fn ($page) => $page
        ->has('agendas.data', 1)
        ->where('agendas.data.0.title', 'React Setup Seminar')
    );

    // Search by type
    $responseType = $this->get(route('events.index', ['type' => 'Workshop']));
    $responseType->assertInertia(fn ($page) => $page
        ->has('agendas.data', 1)
        ->where('agendas.data.0.title', 'Laravel Deep Dive')
    );
});

it('shows active event detail using valid slug', function () {
    $agenda = Agenda::factory()->create([
        'title' => 'Big Laravel Conference',
        'slug' => 'big-laravel-conference',
        'is_active' => true,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    $response = $this->get(route('events.show', $agenda->slug));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Events/Show')
        ->where('agenda.title', 'Big Laravel Conference')
    );
});

it('returns 404 for inactive event detail', function () {
    $agenda = Agenda::factory()->create([
        'title' => 'Secret Inactive Event',
        'slug' => 'secret-inactive-event',
        'is_active' => false,
        'date_start' => now()->addDays(5)->format('Y-m-d'),
    ]);

    $response = $this->get(route('events.show', $agenda->slug));

    $response->assertNotFound();
});
