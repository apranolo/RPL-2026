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
        'indexations' => ['Scopus', 'DOAJ'],
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
