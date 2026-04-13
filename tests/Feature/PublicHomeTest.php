<?php

use App\Models\Journal;
use App\Models\University;
use Illuminate\Support\Facades\Cache;

it('loads the welcome page with correct inertia components and props', function () {
    // Setup test data
    $university = University::factory()->create(['is_active' => true]);

    // Create SINTA 1 & 2 journals (Featured)
    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_1',
        'is_active' => true,
    ]);
    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_2',
        'is_active' => true,
    ]);

    // Non-featured journal
    Journal::factory()->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_3',
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('welcome')
        ->has('featuredJournals', 4)
        ->has('totalUniversities')
        ->has('totalJournals')
        ->has('totalArticles')
        ->has('scientificFields')
    );
});

it('caches the featured journals output', function () {
    $university = University::factory()->create(['is_active' => true]);
    Journal::factory()->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_1',
        'is_active' => true,
    ]);

    // Initial load builds the cache
    expect(Cache::has('featured_journals_welcome'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('featured_journals_welcome'))->toBeTrue();
});

it('can refresh the featured journals cache via artisan command', function () {
    // Put dummy data into the cache
    Cache::put('featured_journals_welcome', collect(['dummy data']), now()->addDay());
    expect(Cache::get('featured_journals_welcome')->first())->toBe('dummy data');

    // Run the command
    $this->artisan('journals:refresh-featured')
        ->expectsOutput('Refreshing featured journals cache...')
        ->expectsOutput('Featured journals cache refreshed successfully!')
        ->assertExitCode(0);

    // Assert cache was refreshed (dummy data replaced by valid collection)
    expect(Cache::get('featured_journals_welcome')->first())->not->toBe('dummy data');
});
