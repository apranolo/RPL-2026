<?php

use App\Models\Journal;
use App\Models\ReviewAssignment;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows reviewer to accept invitation', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $university = University::factory()->create();
    $journal = Journal::factory()->create(['university_id' => $university->id]);
    $submission = Submission::factory()->create(['journal_id' => $journal->id]);

    $assignment = ReviewAssignment::create([
        'reviewer_id' => $reviewer->id,
        'submission_id' => $submission->id,
        'status' => 'Pending',
        'round' => 1,
    ]);

    // Act
    $response = $this->actingAs($reviewer)->post(route('review.accept', $assignment->id));

    // Assert
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Undangan review berhasil diterima.');

    $this->assertDatabaseHas('review_assignments', [
        'id' => $assignment->id,
        'status' => 'Accepted',
    ]);
});

it('allows reviewer to decline invitation with reason', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $university = University::factory()->create();
    $journal = Journal::factory()->create(['university_id' => $university->id]);
    $submission = Submission::factory()->create(['journal_id' => $journal->id]);

    $assignment = ReviewAssignment::create([
        'reviewer_id' => $reviewer->id,
        'submission_id' => $submission->id,
        'status' => 'Pending',
        'round' => 1,
    ]);

    // Act
    $response = $this->actingAs($reviewer)->post(route('review.decline', $assignment->id), [
        'reason' => 'Saya sedang sibuk dengan proyek lain.',
    ]);

    // Assert
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Undangan review berhasil ditolak.');

    $this->assertDatabaseHas('review_assignments', [
        'id' => $assignment->id,
        'status' => 'Declined',
        'decline_reason' => 'Saya sedang sibuk dengan proyek lain.',
    ]);
});

it('prevents unauthorized user from accepting invitation', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $otherUser = User::factory()->create();
    $university = University::factory()->create();
    $journal = Journal::factory()->create(['university_id' => $university->id]);
    $submission = Submission::factory()->create(['journal_id' => $journal->id]);

    $assignment = ReviewAssignment::create([
        'reviewer_id' => $reviewer->id,
        'submission_id' => $submission->id,
        'status' => 'Pending',
        'round' => 1,
    ]);

    // Act
    $response = $this->actingAs($otherUser)->post(route('review.accept', $assignment->id));

    // Assert
    $response->assertStatus(403);
});

it('prevents unauthorized user from declining invitation', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $otherUser = User::factory()->create();
    $university = University::factory()->create();
    $journal = Journal::factory()->create(['university_id' => $university->id]);
    $submission = Submission::factory()->create(['journal_id' => $journal->id]);

    $assignment = ReviewAssignment::create([
        'reviewer_id' => $reviewer->id,
        'submission_id' => $submission->id,
        'status' => 'Pending',
        'round' => 1,
    ]);

    // Act
    $response = $this->actingAs($otherUser)->post(route('review.decline', $assignment->id), [
        'reason' => 'Bukan tugas saya',
    ]);

    // Assert
    $response->assertStatus(403);
});
