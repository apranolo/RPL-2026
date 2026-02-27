<?php

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

uses()->group('feature', 'performance', 'statistics');

beforeEach(function () {
    $this->seedRoles();
    Cache::flush();

    $this->university = University::factory()->create();
    $this->scientificField = ScientificField::factory()->create();
    $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
});

describe('Cache Performance', function () {
    test('cold cache loads statistics within acceptable time', function () {
        // Create 100 journals
        Journal::factory()->count(100)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        Cache::flush(); // Ensure cold cache

        $startTime = microtime(true);
        $response = $this->actingAs($this->user)->get('/dashboard');
        $endTime = microtime(true);

        $response->assertOk();
        $loadTime = ($endTime - $startTime) * 1000; // Convert to ms

        // Should load within 2 seconds even on cold cache
        expect($loadTime)->toBeLessThan(2000);
    })->skip('Performance test - run manually when needed');

    test('warm cache loads statistics significantly faster than cold', function () {
        // Create 100 journals
        Journal::factory()->count(100)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        // Cold cache measurement
        Cache::flush();
        $coldStart = microtime(true);
        $this->actingAs($this->user)->get('/dashboard');
        $coldTime = (microtime(true) - $coldStart) * 1000;

        // Warm cache measurement
        $warmStart = microtime(true);
        $this->actingAs($this->user)->get('/dashboard');
        $warmTime = (microtime(true) - $warmStart) * 1000;

        // Warm cache should be at least 5x faster
        expect($warmTime)->toBeLessThan($coldTime / 5);
    })->skip('Performance test - run manually when needed');

    test('cache reduces database queries significantly', function () {
        // Create 50 journals
        Journal::factory()->count(50)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        // Cold cache - count queries
        Cache::flush();
        DB::enableQueryLog();
        $this->actingAs($this->user)->get('/dashboard');
        $coldQueries = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Warm cache - count queries
        DB::enableQueryLog();
        $this->actingAs($this->user)->get('/dashboard');
        $warmQueries = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Warm cache should have significantly fewer queries
        expect($warmQueries)->toBeLessThan($coldQueries / 2);

        // Warm cache should have minimal queries (auth + cache check)
        expect($warmQueries)->toBeLessThan(10);
    });
});

describe('Large Dataset Handling', function () {
    test('handles 1000+ journals without performance degradation', function () {
        // Create 1000 journals with realistic distribution
        $fields = ScientificField::factory()->count(10)->create();

        for ($i = 0; $i < 1000; $i++) {
            Journal::factory()->create([
                'user_id' => $this->user->id,
                'university_id' => $this->university->id,
                'scientific_field_id' => $fields->random()->id,
                'indexations' => $i % 2 === 0 ? ['Scopus' => true] : null,
                'sinta_rank' => $i % 3 === 0 ? (string) (($i % 6) + 1) : null,
            ]);
        }

        Cache::flush();

        $startTime = microtime(true);
        $response = $this->actingAs($this->user)->get('/dashboard');
        $endTime = microtime(true);

        $response->assertOk();
        $statistics = $response->viewData('page')['props']['statistics'];

        // Verify accuracy
        expect($statistics['totals']['total_journals'])->toBe(1000);

        // Should still load within reasonable time (< 5 seconds)
        $loadTime = ($endTime - $startTime) * 1000;
        expect($loadTime)->toBeLessThan(5000);
    })->skip('Large dataset test - run manually when needed');

    test('statistics calculation is accurate with large datasets', function () {
        // Create exactly 100 journals with known distribution
        // 50% Scopus, 30% SINTA 1, rest evenly distributed

        $field1 = ScientificField::factory()->create(['name' => 'Field A']);
        $field2 = ScientificField::factory()->create(['name' => 'Field B']);

        for ($i = 0; $i < 100; $i++) {
            $indexations = null;
            $sintaRank = null;
            $fieldId = $i < 50 ? $field1->id : $field2->id;

            if ($i < 50) {
                $indexations = ['Scopus' => true];
            }

            if ($i < 30) {
                $sintaRank = '1';
            }

            Journal::factory()->create([
                'user_id' => $this->user->id,
                'university_id' => $this->university->id,
                'scientific_field_id' => $fieldId,
                'indexations' => $indexations,
                'sinta_rank' => $sintaRank,
            ]);
        }

        $response = $this->actingAs($this->user)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(100);
        expect($statistics['totals']['indexed_journals'])->toBe(50);
        expect($statistics['totals']['sinta_journals'])->toBe(30);
        expect($statistics['totals']['non_sinta_journals'])->toBe(70);

        $fieldMap = collect($statistics['by_scientific_field'])->keyBy('name');
        expect($fieldMap['Field A']['count'])->toBe(50);
        expect($fieldMap['Field B']['count'])->toBe(50);
    });

    test('handles edge case: all journals same attributes', function () {
        // 100 journals all with identical indexations and SINTA rank
        Journal::factory()->count(100)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true, 'DOAJ' => true],
            'sinta_rank' => '1',
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(100);
        expect($statistics['totals']['indexed_journals'])->toBe(100);
        expect($statistics['totals']['sinta_journals'])->toBe(100);

        // All should be 100%
        expect($statistics['by_indexation'][0]['percentage'])->toBe(100.0);
        expect($statistics['by_accreditation'][1]['percentage'])->toBe(100.0); // SINTA 1
    });

    test('handles edge case: maximum diversity in attributes', function () {
        // Create journals with maximum variety
        $fields = ScientificField::factory()->count(20)->create();
        $platforms = ['Scopus', 'Web of Science', 'DOAJ', 'Google Scholar', 'PubMed', 'IEEE', 'Springer'];

        for ($i = 0; $i < 100; $i++) {
            $indexations = [];
            $selectedPlatforms = array_rand(array_flip($platforms), rand(0, 3));
            foreach ((array) $selectedPlatforms as $platform) {
                $indexations[$platform] = true;
            }

            Journal::factory()->create([
                'user_id' => $this->user->id,
                'university_id' => $this->university->id,
                'scientific_field_id' => $fields->random()->id,
                'indexations' => ! empty($indexations) ? $indexations : null,
                'sinta_rank' => rand(0, 10) > 5 ? (string) rand(1, 6) : null,
            ]);
        }

        $response = $this->actingAs($this->user)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(100);
        expect($statistics['by_scientific_field'])->not->toBeEmpty();

        // Should have variety in data
        expect(count($statistics['by_indexation']))->toBeGreaterThan(0);
    });
});

describe('Query Optimization', function () {
    test('prevents N+1 query problem with scientific field eager loading', function () {
        $fields = ScientificField::factory()->count(5)->create();

        // Create 50 journals across different fields
        foreach ($fields as $field) {
            Journal::factory()->count(10)->create([
                'user_id' => $this->user->id,
                'university_id' => $this->university->id,
                'scientific_field_id' => $field->id,
            ]);
        }

        Cache::flush();

        // Count queries
        DB::enableQueryLog();
        $this->actingAs($this->user)->get('/dashboard');
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Should not have 50+ queries for scientific fields
        // Expected: user auth (2-3) + journals query (1) + eager load scientific fields (1) = ~5 queries
        expect(count($queries))->toBeLessThan(20);
    });

    test('uses single query for journal aggregation', function () {
        Journal::factory()->count(50)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        Cache::flush();

        DB::enableQueryLog();
        $this->actingAs($this->user)->get('/dashboard');
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Find journal-related queries
        $journalQueries = collect($queries)->filter(function ($query) {
            return str_contains($query['query'], 'journals');
        });

        // Should use minimal queries for journals (1-2 for main query + eager loading)
        expect($journalQueries->count())->toBeLessThanOrEqual(3);
    });
});

describe('Memory Usage', function () {
    test('does not exhaust memory with large datasets', function () {
        $initialMemory = memory_get_usage();

        // Create 500 journals
        Journal::factory()->count(500)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        Cache::flush();

        $beforeRequest = memory_get_usage();
        $this->actingAs($this->user)->get('/dashboard');
        $afterRequest = memory_get_usage();

        $memoryUsed = ($afterRequest - $beforeRequest) / 1024 / 1024; // MB

        // Should not use more than 50 MB for statistics calculation
        expect($memoryUsed)->toBeLessThan(50);
    })->skip('Memory test - run manually when needed');
});

describe('Concurrent Access Performance', function () {
    test('cache handles concurrent requests efficiently', function () {
        // Create test data
        Journal::factory()->count(100)->complete()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        Cache::flush();

        // Simulate first request (creates cache)
        $this->actingAs($this->user)->get('/dashboard');
        expect(Cache::has("dashboard_statistics_user_{$this->user->id}"))->toBeTrue();

        // Simulate concurrent requests (all should hit cache)
        $times = [];
        for ($i = 0; $i < 5; $i++) {
            $start = microtime(true);
            $this->actingAs($this->user)->get('/dashboard');
            $times[] = (microtime(true) - $start) * 1000;
        }

        // All concurrent requests should be fast (< 100ms)
        foreach ($times as $time) {
            expect($time)->toBeLessThan(100);
        }

        // Average should be very low
        $average = array_sum($times) / count($times);
        expect($average)->toBeLessThan(50);
    });
});

describe('Statistics with Realistic Data', function () {
    test('handles realistic university data distribution', function () {
        // Use helper to create realistic test data
        $data = $this->seedStatisticsTestData(
            universitiesCount: 2,
            journalsPerUniversity: 20
        );

        $university = $data['universities']->first();
        $adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $university->id,
        ]);

        $response = $this->actingAs($adminKampus)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        // Should have realistic distribution
        expect($statistics['totals']['total_journals'])->toBeGreaterThan(0);
        expect($statistics['by_indexation'])->not->toBeEmpty();
        expect($statistics['by_scientific_field'])->not->toBeEmpty();

        // Verify percentages sum correctly (accounting for rounding)
        $totalPercentage = collect($statistics['by_accreditation'])
            ->sum('percentage');
        expect($totalPercentage)->toBeGreaterThan(99.0);
        expect($totalPercentage)->toBeLessThan(101.0);
    });
});
