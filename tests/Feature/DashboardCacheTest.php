<?php

use App\Http\Controllers\DashboardController;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

uses()->group('feature', 'cache', 'statistics');

beforeEach(function () {
    $this->seedRoles();
    Cache::flush();

    $this->university = University::factory()->create();
    $this->scientificField = ScientificField::factory()->create();

    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->adminKampus = User::factory()->adminKampus()->create(['university_id' => $this->university->id]);
    $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
});

describe('Cache Creation and Keys', function () {
    test('Super Admin statistics are cached with correct key', function () {
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $this->actingAs($this->superAdmin)->get('/dashboard');

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeTrue();
    });

    test('Admin Kampus statistics are cached with university-specific key', function () {
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $this->actingAs($this->adminKampus)->get('/dashboard');

        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();
    });

    test('User statistics are cached with user-specific key', function () {
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $this->actingAs($this->user)->get('/dashboard');

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();
    });
});

describe('Cache Hit Performance', function () {
    test('second request uses cached data and is faster', function () {
        // Create test data
        Journal::factory()->count(50)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Clear any existing cache
        Cache::forget("dashboard_statistics_user_{$this->user->id}");

        // First request (cold cache) - should create cache
        $this->actingAs($this->user)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Get cached statistics directly
        $cachedStats = Cache::get("dashboard_statistics_user_{$this->user->id}");
        expect($cachedStats)->toBeArray();
        expect($cachedStats['totals']['total_journals'])->toBe(50);

        // Second request (warm cache) - should use cached data
        $response = $this->actingAs($this->user)->get('/dashboard');
        $stats = $response->viewData('page')['props']['statistics'];

        // Statistics from response should match cached statistics
        expect($stats['totals']['total_journals'])->toBe($cachedStats['totals']['total_journals']);
        expect($stats['totals']['indexed_journals'])->toBe($cachedStats['totals']['indexed_journals']);
    });

    test('cached statistics data is identical to fresh calculation', function () {
        Journal::factory()->count(10)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true],
            'sinta_rank' => 'sinta_1',
        ]);

        // First request - caches data
        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];

        // Second request - from cache
        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];

        expect($stats1)->toEqual($stats2);
    });
});

describe('Cache Invalidation on Journal Created', function () {
    test('creating journal clears Super Admin cache', function () {
        // Prime cache
        $this->actingAs($this->superAdmin)->get('/dashboard');
        expect(Cache::has('dashboard_statistics_super_admin'))->toBeTrue();

        // Create journal - should clear cache
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeFalse();
    });

    test('creating journal clears university-specific cache', function () {
        // Prime cache
        $this->actingAs($this->adminKampus)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();

        // Create journal - should clear cache
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeFalse();
    });

    test('creating journal clears user-specific cache', function () {
        // Prime cache
        $this->actingAs($this->user)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Create journal - should clear cache
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
    });

    test('statistics are recalculated after journal creation', function () {
        // Initial state: 0 journals
        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['total_journals'])->toBe(0);

        // Create journal
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // After creation: 1 journal
        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['total_journals'])->toBe(1);
    });
});

describe('Cache Invalidation on Journal Updated', function () {
    test('updating journal clears relevant caches', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime caches
        $this->actingAs($this->superAdmin)->get('/dashboard');
        $this->actingAs($this->adminKampus)->get('/dashboard');
        $this->actingAs($this->user)->get('/dashboard');

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeTrue();
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Update journal - should clear all relevant caches
        $journal->update(['title' => 'Updated Title']);

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeFalse();
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeFalse();
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
    });

    test('changing indexations updates statistics', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => null,
        ]);

        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['indexed_journals'])->toBe(0);

        // Update to add Scopus indexation
        $journal->update(['indexations' => ['Scopus' => true]]);

        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['indexed_journals'])->toBe(1);
    });

    test('changing SINTA rank updates statistics', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'non_sinta',
        ]);

        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['sinta_journals'])->toBe(0);
        expect($stats1['totals']['non_sinta_journals'])->toBe(1);

        // Update to SINTA 1
        $journal->update(['sinta_rank' => 'sinta_1']);

        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['sinta_journals'])->toBe(1);
        expect($stats2['totals']['non_sinta_journals'])->toBe(0);
    });

    test('changing university_id clears old and new university caches', function () {
        $university2 = University::factory()->create();

        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime both university caches
        Cache::put("dashboard_statistics_university_{$this->university->id}", ['test' => 1], 3600);
        Cache::put("dashboard_statistics_university_{$university2->id}", ['test' => 2], 3600);

        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();
        expect(Cache::has("dashboard_statistics_university_{$university2->id}"))->toBeTrue();

        // Move journal to university2
        $journal->update(['university_id' => $university2->id]);

        // Both caches should be cleared
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeFalse();
        expect(Cache::has("dashboard_statistics_university_{$university2->id}"))->toBeFalse();
    });

    test('changing user_id clears old and new user caches', function () {
        $user2 = User::factory()->user()->create(['university_id' => $this->university->id]);

        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime both user caches
        Cache::put("dashboard_statistics_user_{$this->user->id}", ['test' => 1], 3600);
        Cache::put("dashboard_statistics_user_{$user2->id}", ['test' => 2], 3600);

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();
        expect(Cache::has("dashboard_statistics_user_{$user2->id}"))->toBeTrue();

        // Reassign journal to user2
        $journal->update(['user_id' => $user2->id]);

        // Both caches should be cleared
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
        expect(Cache::has("dashboard_statistics_user_{$user2->id}"))->toBeFalse();
    });
});

describe('Cache Invalidation on Journal Deleted', function () {
    test('soft deleting journal clears caches', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime caches
        $this->actingAs($this->user)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Soft delete
        $journal->delete();

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
    });

    test('statistics reflect journal deletion', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['total_journals'])->toBe(1);

        // Delete journal
        $journal->delete();

        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['total_journals'])->toBe(0);
    });
});

describe('Cache Invalidation on Journal Restored', function () {
    test('restoring journal clears caches', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $journal->delete();

        // Prime cache after deletion
        $this->actingAs($this->user)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Restore
        $journal->restore();

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
    });

    test('statistics reflect journal restoration', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $journal->delete();

        $response1 = $this->actingAs($this->user)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['total_journals'])->toBe(0);

        // Restore
        $journal->restore();

        $response2 = $this->actingAs($this->user)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['total_journals'])->toBe(1);
    });
});

describe('Multi-Tenant Cache Isolation', function () {
    test('university 1 cache is independent from university 2', function () {
        $university2 = University::factory()->create();
        $adminKampus2 = User::factory()->adminKampus()->create(['university_id' => $university2->id]);

        // Create journals in university 1
        Journal::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime university 1 cache
        $this->actingAs($this->adminKampus)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();

        // Prime university 2 cache
        $this->actingAs($adminKampus2)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_university_{$university2->id}"))->toBeTrue();

        // Create journal in university 2 - should only clear university 2 cache
        Journal::factory()->create([
            'user_id' => $adminKampus2->id,
            'university_id' => $university2->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // University 1 cache should remain (not affected by university 2 journal creation)
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();
        // University 2 cache should be cleared
        expect(Cache::has("dashboard_statistics_university_{$university2->id}"))->toBeFalse();
    });

    test('user cache is independent between different users', function () {
        $user2 = User::factory()->user()->create(['university_id' => $this->university->id]);

        // Create journals for user 1
        Journal::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // Prime both caches
        $this->actingAs($this->user)->get('/dashboard');
        $this->actingAs($user2)->get('/dashboard');

        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();
        expect(Cache::has("dashboard_statistics_user_{$user2->id}"))->toBeTrue();

        // Create journal for user 2
        Journal::factory()->create([
            'user_id' => $user2->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        // User 2 cache should be cleared, user 1 cache might be cleared by university/super admin clear
        expect(Cache::has("dashboard_statistics_user_{$user2->id}"))->toBeFalse();
    });
});

describe('Manual Cache Clearing', function () {
    test('DashboardController::clearStatisticsCache can be called manually', function () {
        // Prime caches
        $this->actingAs($this->superAdmin)->get('/dashboard');
        $this->actingAs($this->adminKampus)->get('/dashboard');
        $this->actingAs($this->user)->get('/dashboard');

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeTrue();
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeTrue();
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Manual clear
        DashboardController::clearStatisticsCache($this->university->id, $this->user->id);

        expect(Cache::has('dashboard_statistics_super_admin'))->toBeFalse();
        expect(Cache::has("dashboard_statistics_university_{$this->university->id}"))->toBeFalse();
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeFalse();
    });
});
