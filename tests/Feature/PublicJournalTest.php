<?php

use App\Models\Journal;
use App\Models\University;

it('loads the public journals index with required statistics properties', function () {
    // Create necessary data
    $university = University::factory()->create(['is_active' => true]);

    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_2',
        'is_active' => true,
        'indexations' => [
            'Scopus' => ['status' => true],
            'DOAJ' => ['status' => true],
        ],
    ]);

    $response = $this->get(route('journals.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals')
        ->has('sintaStats')
        ->has('indexationStats')
        ->has('universities')
        ->has('scientificFields')
        ->has('sintaRanks')
        ->has('indexationOptions')
    );
});

it('filters journals by indexation including names with spaces', function () {
    $university = University::factory()->create(['is_active' => true]);

    // Create one Scopus and one Web of Science journal
    Journal::factory()->create([
        'title' => 'Scopus Journal',
        'university_id' => $university->id,
        'indexations' => ['Scopus' => ['status' => true]],
        'is_active' => true,
    ]);

    Journal::factory()->create([
        'title' => 'WOS Journal',
        'university_id' => $university->id,
        'indexations' => ['Web of Science' => ['status' => true]],
        'is_active' => true,
    ]);

    // Test filtering by 'Web of Science' (has spaces)
    $response = $this->get(route('journals.index', ['indexation' => 'Web of Science']));

    $response->assertStatus(200);
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals.data', 1)
        ->where('journals.data.0.title', 'WOS Journal')
    );

    // Test filtering by 'Scopus'
    $response = $this->get(route('journals.index', ['indexation' => 'Scopus']));

    $response->assertStatus(200);
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals.data', 1)
        ->where('journals.data.0.title', 'Scopus Journal')
    );
});
