<?php

use App\Models\AssessmentCriteria;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->proposal = Proposal::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $this->review = Review::create([
        'proposal_id' => $this->proposal->id,
        'reviewer_id' => $this->user->id,
        'status' => 'pending',
        'notes' => 'Initial review notes.',
    ]);
});

test('review can be created and has expected fillable attributes', function () {
    $fillable = (new Review)->getFillable();

    expect($fillable)->toContain('proposal_id')
        ->and($fillable)->toContain('reviewer_id')
        ->and($fillable)->toContain('status')
        ->and($fillable)->toContain('notes');

    expect($this->review)->toBeInstanceOf(Review::class)
        ->and($this->review->status)->toBe('pending')
        ->and($this->review->notes)->toBe('Initial review notes.');
});

test('review belongs to a proposal and a reviewer', function () {
    expect($this->review->proposal)->toBeInstanceOf(Proposal::class)
        ->and($this->review->proposal->id)->toBe($this->proposal->id)
        ->and($this->review->reviewer)->toBeInstanceOf(User::class)
        ->and($this->review->reviewer->id)->toBe($this->user->id);
});

test('review has assessment criteria relationship', function () {
    $criteria = AssessmentCriteria::create([
        'review_id' => $this->review->id,
        'criterion' => 'Technical quality',
        'score' => 85,
        'notes' => 'Good structure and clarity.',
    ]);

    expect($this->review->assessmentCriteria)->toHaveCount(1)
        ->and($this->review->assessmentCriteria->first())->toBeInstanceOf(AssessmentCriteria::class)
        ->and($this->review->assessmentCriteria->first()->criterion)->toBe('Technical quality')
        ->and($this->review->assessmentCriteria->first()->score)->toBe(85);
});

test('assessment criteria can be created and belongs to a review', function () {
    $criteria = AssessmentCriteria::create([
        'review_id' => $this->review->id,
        'criterion' => 'Originality',
        'score' => 90,
        'notes' => 'The proposal presents a fresh idea.',
    ]);

    expect($criteria)->toBeInstanceOf(AssessmentCriteria::class)
        ->and($criteria->review)->toBeInstanceOf(Review::class)
        ->and($criteria->review->id)->toBe($this->review->id);
});
