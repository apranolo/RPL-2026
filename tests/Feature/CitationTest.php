<?php

use App\Models\Citation;
use App\Models\User;
use App\Services\ScholarService;

beforeEach(function () {
    $this->seedRoles();
});

test('guests are redirected to login from the citation profile page', function () {
    $this->get(route('profile.citation'))->assertRedirect(route('login'));
});

test('non-Dosen roles cannot access the citation profile page', function () {
    $admin = User::factory()->adminKampus()->create();

    $this->actingAs($admin)->get(route('profile.citation'))->assertForbidden();
    $this->actingAs($admin)->post(route('profile.citation.sync'))->assertForbidden();
});

test('citation profile page renders with null data when never synced', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->get(route('profile.citation'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Citation')
            ->where('citationData', null)
        );
});

test('citation profile page renders synced stats', function () {
    $user = User::factory()->user()->create();

    Citation::create([
        'user_id' => $user->id,
        'h_index' => 12,
        'total_citations' => 340,
        'yearly_data' => [
            ['year' => 2025, 'citations' => 150],
            ['year' => 2026, 'citations' => 190],
        ],
        'last_synced_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('profile.citation'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Citation')
            ->where('citationData.id_user', $user->id)
            ->where('citationData.h_index', 12)
            ->where('citationData.total_citations', 340)
            ->has('citationData.yearly_data', 2)
            ->whereNot('citationData.last_synced_at', null)
        );
});

test('sync creates a citation record with scholar stats', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('profile.citation'))
        ->post(route('profile.citation.sync'))
        ->assertRedirect(route('profile.citation'))
        ->assertSessionHas('success', 'Data sitasi Google Scholar berhasil disinkronkan!');

    $citation = $user->fresh()->citation;

    expect($citation)->not->toBeNull()
        ->and($citation->h_index)->toBeGreaterThanOrEqual(5)->toBeLessThanOrEqual(30)
        ->and($citation->total_citations)->toBeGreaterThanOrEqual(50)->toBeLessThanOrEqual(500)
        ->and($citation->yearly_data)->toBeArray()->toHaveCount(5)
        ->and($citation->last_synced_at)->not->toBeNull();
});

test('sync updates the existing citation record instead of creating a duplicate', function () {
    $user = User::factory()->user()->create();

    Citation::create([
        'user_id' => $user->id,
        'h_index' => 1,
        'total_citations' => 1,
    ]);

    $this->actingAs($user)->post(route('profile.citation.sync'))->assertRedirect();

    expect(Citation::where('user_id', $user->id)->count())->toBe(1)
        ->and($user->fresh()->citation->last_synced_at)->not->toBeNull();
});

test('scholar service returns stats in the expected shape', function () {
    $user = User::factory()->user()->create();

    $stats = app(ScholarService::class)->fetch($user);

    expect($stats)->toHaveKeys(['h_index', 'total_citations', 'yearly_data'])
        ->and($stats['h_index'])->toBeGreaterThanOrEqual(5)->toBeLessThanOrEqual(30)
        ->and($stats['yearly_data'])->toHaveCount(5)->each->toHaveKeys(['year', 'citations'])
        ->and($stats['total_citations'])->toBe(array_sum(array_column($stats['yearly_data'], 'citations')));
});

test('scholar service returns stable stats for the same user', function () {
    $user = User::factory()->user()->create();

    $service = app(ScholarService::class);

    expect($service->fetch($user))->toBe($service->fetch($user));
});

test('citation model appends id_user virtual attribute', function () {
    $user = User::factory()->user()->create();

    $citation = Citation::create(['user_id' => $user->id]);

    expect($citation->id_user)->toBe($user->id)
        ->and($citation->toArray())->toHaveKey('id_user', $user->id);
});
