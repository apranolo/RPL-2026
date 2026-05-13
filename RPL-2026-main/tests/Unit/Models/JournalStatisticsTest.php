<?php

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;

uses()->group('unit', 'journal', 'statistics');

beforeEach(function () {
    $this->seedRoles();

    // Create test university and user
    $this->university = University::factory()->create(['name' => 'Test University']);
    $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
    $this->scientificField = ScientificField::factory()->create(['name' => 'Test Field']);
});

describe('Journal Indexation Scopes', function () {
    test('scopeByIndexation filters journals by specific platform', function () {
        // Create journals with different indexations
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true],
        ]);

        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Google Scholar' => true],
        ]);

        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true, 'DOAJ' => true],
        ]);

        $scopusJournals = Journal::byIndexation('Scopus')->get();
        expect($scopusJournals)->toHaveCount(2);

        $scholarJournals = Journal::byIndexation('Google Scholar')->get();
        expect($scholarJournals)->toHaveCount(1);
    });

    test('scopeByIndexation returns all journals when platform is null', function () {
        Journal::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $journals = Journal::byIndexation(null)->get();
        expect($journals)->toHaveCount(3);
    });

    test('scopeIndexedInScopus filters only Scopus-indexed journals', function () {
        // Scopus indexed
        Journal::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true],
        ]);

        // Non-Scopus indexed
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['DOAJ' => true],
        ]);

        // No indexation
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => null,
        ]);

        $scopusJournals = Journal::indexedInScopus()->get();
        expect($scopusJournals)->toHaveCount(2);
    });

    test('scopeByIndexation handles multiple indexations correctly', function () {
        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => [
                'Scopus' => true,
                'Web of Science' => true,
                'DOAJ' => true,
            ],
        ]);

        expect(Journal::byIndexation('Scopus')->count())->toBe(1);
        expect(Journal::byIndexation('Web of Science')->count())->toBe(1);
        expect(Journal::byIndexation('DOAJ')->count())->toBe(1);
    });
});

describe('Journal SINTA Rank Scopes', function () {
    test('scopeBySintaRank filters journals by SINTA rank', function () {
        // Create journals with different SINTA ranks
        Journal::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'sinta_1',
        ]);

        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'sinta_2',
        ]);

        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'non_sinta', // Non-SINTA
        ]);

        $sinta1 = Journal::bySintaRank('sinta_1')->get();
        expect($sinta1)->toHaveCount(2);

        $sinta2 = Journal::bySintaRank('sinta_2')->get();
        expect($sinta2)->toHaveCount(1);
    });

    test('scopeBySintaRank returns all journals when rank is null', function () {
        Journal::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $journals = Journal::bySintaRank(null)->get();
        expect($journals)->toHaveCount(3);
    });

    test('filters non-SINTA journals correctly', function () {
        Journal::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'non_sinta',
        ]);

        Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'sinta_1',
        ]);

        $nonSinta = Journal::where('sinta_rank', 'non_sinta')->get();
        expect($nonSinta)->toHaveCount(2);
    });
});

describe('Journal Indexation Helpers', function () {
    test('isIndexedInScopus returns true for Scopus-indexed journals', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['Scopus' => true],
        ]);

        expect($journal->isIndexedInScopus())->toBeTrue();
    });

    test('isIndexedInScopus returns false for non-Scopus journals', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => ['DOAJ' => true],
        ]);

        expect($journal->isIndexedInScopus())->toBeFalse();
    });

    test('isIndexedInScopus returns false when indexations is null', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => null,
        ]);

        expect($journal->isIndexedInScopus())->toBeFalse();
    });

    test('getIndexationLabelsAttribute returns array of indexation names', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => [
                'Scopus' => true,
                'Web of Science' => true,
                'DOAJ' => true,
            ],
        ]);

        $labels = $journal->indexation_labels;
        expect($labels)->toBeArray()
            ->toHaveCount(3)
            ->toContain('Scopus', 'Web of Science', 'DOAJ');
    });

    test('getIndexationLabelsAttribute returns empty array when no indexations', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => null,
        ]);

        expect($journal->indexation_labels)->toBeArray()->toBeEmpty();
    });

    test('getIndexationLabelsAttribute handles empty array indexations', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => [],
        ]);

        expect($journal->indexation_labels)->toBeArray()->toBeEmpty();
    });
});

describe('Journal Statistics Edge Cases', function () {
    test('handles journals with complex indexation structures', function () {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'indexations' => [
                'Scopus' => true,
                'Google Scholar' => true,
                'Web of Science' => true,
                'DOAJ' => true,
                'Sinta' => true,
            ],
        ]);

        expect($journal->isIndexedInScopus())->toBeTrue();
        expect($journal->indexation_labels)->toHaveCount(5);
        expect(Journal::byIndexation('Scopus')->count())->toBe(1);
        expect(Journal::byIndexation('DOAJ')->count())->toBe(1);
    });

    test('handles all SINTA ranks 1-6', function () {
        for ($rank = 1; $rank <= 6; $rank++) {
            Journal::factory()->create([
                'user_id' => $this->user->id,
                'university_id' => $this->university->id,
                'scientific_field_id' => $this->scientificField->id,
                'sinta_rank' => "sinta_{$rank}",
            ]);
        }

        for ($rank = 1; $rank <= 6; $rank++) {
            expect(Journal::bySintaRank("sinta_{$rank}")->count())->toBe(1);
        }
    });

    test('scientific field relationship works for statistics', function () {
        $field1 = ScientificField::factory()->create(['name' => 'Engineering']);
        $field2 = ScientificField::factory()->create(['name' => 'Medicine']);

        Journal::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field1->id,
        ]);

        Journal::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field2->id,
        ]);

        $engineeringJournals = Journal::where('scientific_field_id', $field1->id)->get();
        expect($engineeringJournals)->toHaveCount(3);
        expect($engineeringJournals->first()->scientificField->name)->toBe('Engineering');
    });

    test('university relationship works for role-based scoping', function () {
        $university1 = University::factory()->create(['name' => 'University A']);
        $university2 = University::factory()->create(['name' => 'University B']);

        Journal::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'university_id' => $university1->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        Journal::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'university_id' => $university2->id,
            'scientific_field_id' => $this->scientificField->id,
        ]);

        $uni1Journals = Journal::where('university_id', $university1->id)->get();
        expect($uni1Journals)->toHaveCount(3);
        expect($uni1Journals->first()->university->name)->toBe('University A');
    });
});
