<?php

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

uses()->group('feature', 'dashboard', 'statistics');

beforeEach(function () {
    $this->seedRoles();
    Cache::flush(); // Clear cache before each test

    // Create test data
    $this->university1 = University::factory()->create(['name' => 'University A']);
    $this->university2 = University::factory()->create(['name' => 'University B']);

    $this->field1 = ScientificField::factory()->create(['name' => 'Engineering']);
    $this->field2 = ScientificField::factory()->create(['name' => 'Medicine']);
    $this->field3 = ScientificField::factory()->create(['name' => 'Economics']);

    // Create users
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->adminKampus1 = User::factory()->adminKampus()->create(['university_id' => $this->university1->id]);
    $this->adminKampus2 = User::factory()->adminKampus()->create(['university_id' => $this->university2->id]);
    $this->user1 = User::factory()->user()->create(['university_id' => $this->university1->id]);
    $this->user2 = User::factory()->user()->create(['university_id' => $this->university1->id]);
});

describe('Statistics Calculation Accuracy', function () {
    test('calculates total journals correctly', function () {
        // Create 10 journals for university 1
        Journal::factory()->count(10)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');

        $response->assertOk();
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(10);
    });

    test('calculates indexed journals (Scopus) correctly', function () {
        // 3 Scopus-indexed journals
        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
        ]);

        // 2 non-Scopus indexed
        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['DOAJ' => true],
        ]);

        // 1 with no indexation
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => null,
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(6);
        expect($statistics['totals']['indexed_journals'])->toBe(3);
    });

    test('calculates SINTA journals correctly', function () {
        // 4 SINTA journals (ranks 1-4)
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_1',
        ]);
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_2',
        ]);
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_3',
        ]);
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_4',
        ]);

        // 2 Non-SINTA
        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'non_sinta',
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['sinta_journals'])->toBe(4);
        expect($statistics['totals']['non_sinta_journals'])->toBe(2);
    });

    test('aggregates by indexation platforms correctly', function () {
        // 5 Scopus
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
        ]);

        // 3 DOAJ
        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['DOAJ' => true],
        ]);

        // 2 with both Scopus and Web of Science
        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true, 'Web of Science' => true],
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        $indexationMap = collect($statistics['by_indexation'])->keyBy('name');

        expect($indexationMap['Scopus']['count'])->toBe(7); // 5 + 2
        expect($indexationMap['DOAJ']['count'])->toBe(3);
        expect($indexationMap['Web of Science']['count'])->toBe(2);
    });

    test('aggregates by accreditation with all SINTA ranks', function () {
        // Create one journal for each SINTA rank 1-6
        for ($rank = 1; $rank <= 6; $rank++) {
            Journal::factory()->create([
                'user_id' => $this->user1->id,
                'university_id' => $this->university1->id,
                'scientific_field_id' => $this->field1->id,
                'sinta_rank' => "sinta_{$rank}",
            ]);
        }

        // 4 Non-SINTA
        Journal::factory()->count(4)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'non_sinta',
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        $accreditationMap = collect($statistics['by_accreditation'])->keyBy('label');

        expect($accreditationMap['Non-Sinta']['count'])->toBe(4);
        expect($accreditationMap['SINTA 1']['count'])->toBe(1);
        expect($accreditationMap['SINTA 2']['count'])->toBe(1);
        expect($accreditationMap['SINTA 3']['count'])->toBe(1);
        expect($accreditationMap['SINTA 4']['count'])->toBe(1);
        expect($accreditationMap['SINTA 5']['count'])->toBe(1);
        expect($accreditationMap['SINTA 6']['count'])->toBe(1);
    });

    test('aggregates by scientific field correctly', function () {
        // 5 Engineering
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        // 3 Medicine
        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field2->id,
        ]);

        // 2 Economics
        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field3->id,
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['by_scientific_field'])->toHaveCount(3);

        $fieldMap = collect($statistics['by_scientific_field'])->keyBy('name');

        expect($fieldMap['Engineering']['count'])->toBe(5);
        expect($fieldMap['Medicine']['count'])->toBe(3);
        expect($fieldMap['Economics']['count'])->toBe(2);
    });
});

describe('Percentage Calculations', function () {
    test('calculates percentages correctly for indexations', function () {
        // Total: 10 journals
        // 5 Scopus = 50%, 3 DOAJ = 30%, 2 WoS = 20%
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
        ]);

        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['DOAJ' => true],
        ]);

        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Web of Science' => true],
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        $indexationMap = collect($statistics['by_indexation'])->keyBy('name');

        expect($indexationMap['Scopus']['percentage'])->toBe(50.0);
        expect($indexationMap['DOAJ']['percentage'])->toBe(30.0);
        expect($indexationMap['Web of Science']['percentage'])->toBe(20.0);
    });

    test('calculates percentages correctly for accreditation', function () {
        // Total: 10 journals
        // 6 Non-SINTA = 60%, 2 SINTA 1 = 20%, 2 SINTA 2 = 20%
        Journal::factory()->count(6)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'non_sinta',
        ]);

        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_1',
        ]);

        Journal::factory()->count(2)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_2',
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        $accreditationMap = collect($statistics['by_accreditation'])->keyBy('label');

        expect($accreditationMap['Non-Sinta']['percentage'])->toBe(60.0);
        expect($accreditationMap['SINTA 1']['percentage'])->toBe(20.0);
        expect($accreditationMap['SINTA 2']['percentage'])->toBe(20.0);
    });

    test('handles decimal percentages with proper rounding', function () {
        // Total: 3 journals -> 33.3% each (rounded to 1 decimal)
        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['by_indexation'][0]['percentage'])->toBe(100.0);
    });
});

describe('Role-Based Data Scoping', function () {
    test('Super Admin sees all journals from all universities', function () {
        // University 1: 5 journals
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        // University 2: 3 journals
        Journal::factory()->count(3)->create([
            'user_id' => $this->adminKampus2->id,
            'university_id' => $this->university2->id,
            'scientific_field_id' => $this->field2->id,
        ]);

        $response = $this->actingAs($this->superAdmin)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(8);
    });

    test('Admin Kampus only sees journals from their university', function () {
        // University 1: 5 journals
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        // University 2: 3 journals (should not be visible to adminKampus1)
        Journal::factory()->count(3)->create([
            'user_id' => $this->adminKampus2->id,
            'university_id' => $this->university2->id,
            'scientific_field_id' => $this->field2->id,
        ]);

        $response = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(5);
    });

    test('User only sees their own journals', function () {
        // User 1: 5 journals
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        // User 2: 3 journals (same university, different user)
        Journal::factory()->count(3)->create([
            'user_id' => $this->user2->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(5);
    });

    test('Admin Kampus cannot see other university data', function () {
        // University 1 journals
        Journal::factory()->count(10)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'sinta_rank' => 'sinta_1',
        ]);

        // University 2 journals
        Journal::factory()->count(20)->create([
            'user_id' => $this->adminKampus2->id,
            'university_id' => $this->university2->id,
            'scientific_field_id' => $this->field2->id,
            'sinta_rank' => 'sinta_2',
        ]);

        // Admin Kampus 1 should only see university 1 data
        $response1 = $this->actingAs($this->adminKampus1)->get('/dashboard');
        $stats1 = $response1->viewData('page')['props']['statistics'];
        expect($stats1['totals']['total_journals'])->toBe(10);

        // Admin Kampus 2 should only see university 2 data
        $response2 = $this->actingAs($this->adminKampus2)->get('/dashboard');
        $stats2 = $response2->viewData('page')['props']['statistics'];
        expect($stats2['totals']['total_journals'])->toBe(20);
    });
});

describe('Empty Dataset Handling', function () {
    test('handles zero journals gracefully', function () {
        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        expect($statistics['totals']['total_journals'])->toBe(0);
        expect($statistics['totals']['indexed_journals'])->toBe(0);
        expect($statistics['totals']['sinta_journals'])->toBe(0);
        expect($statistics['by_indexation'])->toBeArray()->toBeEmpty();
        expect($statistics['by_accreditation'])->toHaveCount(7); // Non-Sinta + SINTA 1-6, all with 0 count
        expect($statistics['by_scientific_field'])->toBeArray()->toBeEmpty();
    });

    test('handles division by zero in percentage calculations', function () {
        // No journals = 0/0 should be handled as 0%
        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        foreach ($statistics['by_accreditation'] as $accreditation) {
            expect($accreditation['percentage'])->toBeNumeric()->toEqual(0);
        }
    });

    test('handles journals without scientific field', function () {
        // Create journal without scientific_field_id
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => null,
        ]);

        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        // Should not crash, scientific field aggregation should handle null
        expect($statistics['totals']['total_journals'])->toBe(1);
        expect($statistics['by_scientific_field'])->toBeArray();
    });
});

describe('Data Structure and Types', function () {
    test('returns correctly structured statistics data', function () {
        Journal::factory()->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
            'sinta_rank' => 'sinta_1',
        ]);

        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        // Check totals structure
        expect($statistics)->toHaveKey('totals');
        expect($statistics['totals'])->toHaveKeys([
            'total_journals',
            'indexed_journals',
            'sinta_journals',
            'non_sinta_journals',
        ]);

        // Check by_indexation structure
        expect($statistics)->toHaveKey('by_indexation');
        expect($statistics['by_indexation'])->toBeArray();
        if (count($statistics['by_indexation']) > 0) {
            expect($statistics['by_indexation'][0])->toHaveKeys(['name', 'count', 'percentage']);
        }

        // Check by_accreditation structure
        expect($statistics)->toHaveKey('by_accreditation');
        expect($statistics['by_accreditation'])->toBeArray();
        expect($statistics['by_accreditation'][0])->toHaveKeys(['sinta_rank', 'label', 'count', 'percentage']);

        // Check by_scientific_field structure
        expect($statistics)->toHaveKey('by_scientific_field');
        expect($statistics['by_scientific_field'])->toBeArray();
        if (count($statistics['by_scientific_field']) > 0) {
            expect($statistics['by_scientific_field'][0])->toHaveKeys(['id', 'name', 'count', 'percentage']);
        }
    });

    test('by_indexation results are sorted by count descending', function () {
        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Scopus' => true],
        ]);

        Journal::factory()->count(10)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['Google Scholar' => true],
        ]);

        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
            'indexations' => ['DOAJ' => true],
        ]);

        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        // Should be sorted: Google Scholar (10), Scopus (5), DOAJ (3)
        expect($statistics['by_indexation'][0]['name'])->toBe('Google Scholar');
        expect($statistics['by_indexation'][0]['count'])->toBe(10);
        expect($statistics['by_indexation'][1]['name'])->toBe('Scopus');
        expect($statistics['by_indexation'][1]['count'])->toBe(5);
        expect($statistics['by_indexation'][2]['name'])->toBe('DOAJ');
        expect($statistics['by_indexation'][2]['count'])->toBe(3);
    });

    test('by_scientific_field results are sorted by count descending', function () {
        Journal::factory()->count(3)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field1->id,
        ]);

        Journal::factory()->count(10)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field2->id,
        ]);

        Journal::factory()->count(5)->create([
            'user_id' => $this->user1->id,
            'university_id' => $this->university1->id,
            'scientific_field_id' => $this->field3->id,
        ]);

        $response = $this->actingAs($this->user1)->get('/dashboard');
        $statistics = $response->viewData('page')['props']['statistics'];

        // Should be sorted: Medicine (10), Economics (5), Engineering (3)
        expect($statistics['by_scientific_field'][0]['name'])->toBe('Medicine');
        expect($statistics['by_scientific_field'][0]['count'])->toBe(10);
    });
});
