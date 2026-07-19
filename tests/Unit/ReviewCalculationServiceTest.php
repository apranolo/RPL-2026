<?php

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\User;
use App\Services\ReviewCalculationService;

test('calculate() returns default empty statistics when no assessments exist', function () {
    $service = new ReviewCalculationService;
    $result = $service->calculate();

    expect($result)->toBeArray()
        ->and($result['total'])->toBe(0)
        ->and($result['draft'])->toBe(0)
        ->and($result['submitted'])->toBe(0)
        ->and($result['reviewed'])->toBe(0)
        ->and($result['avg_score'])->toBeNull()
        ->and($result['avg_percentage'])->toBeNull()
        ->and($result['highest_score'])->toBeNull()
        ->and($result['lowest_score'])->toBeNull()
        ->and($result['completion_rate'])->toBe(0.0)
        ->and($result['grade_distribution'])->toBeArray();
});

test('calculateSingle() computes correct scores for a given assessment', function () {
    $service = new ReviewCalculationService;

    $user = User::factory()->create();
    $journal = Journal::factory()->create();

    JournalAssessment::create([
        'id' => 1,
        'journal_id' => $journal->id,
        'user_id' => $user->id,
        'status' => 'draft',
        'total_score' => 0.00,
        'percentage' => 0.00,
    ]);

    JournalAssessment::create([
        'id' => 2,
        'journal_id' => $journal->id,
        'user_id' => $user->id,
        'status' => 'submitted',
        'total_score' => 85.00,
        'percentage' => 85.00,
    ]);

    JournalAssessment::create([
        'id' => 3,
        'journal_id' => $journal->id,
        'user_id' => $user->id,
        'status' => 'reviewed',
        'total_score' => 95.00,
        'percentage' => 95.00,
    ]);

    $result = $service->calculate();

    expect($result['total'])->toBe(3)
        ->and($result['draft'])->toBe(1)
        ->and($result['submitted'])->toBe(1)
        ->and($result['reviewed'])->toBe(1)
        ->and($result['avg_score'])->toBe(90.0)
        ->and($result['avg_percentage'])->toBe(90.0)
        ->and($result['highest_score'])->toBe(95.0)
        ->and($result['lowest_score'])->toBe(85.0)
        ->and($result['completion_rate'])->toBe(66.7);
});
