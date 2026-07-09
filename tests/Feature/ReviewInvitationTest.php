<?php

use App\Models\User;
use App\Models\ReviewerAssignment;
use App\Models\PembinaanRegistration;

it('allows reviewer to accept invitation', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $registration = PembinaanRegistration::factory()->create();
    $assignment = ReviewerAssignment::create([
        'reviewer_id' => $reviewer->id,
        'registration_id' => $registration->id,
        'assigned_by' => User::factory()->create()->id,
        'status' => 'assigned',
    ]);

    // Act
    $response = $this->actingAs($reviewer)->post(route('review.accept', $assignment->id));

    // Assert
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Undangan review berhasil diterima.');
    
    $this->assertDatabaseHas('reviewer_assignments', [
        'id' => $assignment->id,
        'status' => 'accepted',
    ]);
});

it('allows reviewer to decline invitation with reason', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $registration = PembinaanRegistration::factory()->create();
    $assignment = ReviewerAssignment::create([
        'reviewer_id' => $reviewer->id,
        'registration_id' => $registration->id,
        'assigned_by' => User::factory()->create()->id,
        'status' => 'assigned',
    ]);

    // Act
    $response = $this->actingAs($reviewer)->post(route('review.decline', $assignment->id), [
        'reason' => 'Saya sedang sibuk dengan proyek lain.',
    ]);

    // Assert
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Undangan review berhasil ditolak.');
    
    $this->assertDatabaseHas('reviewer_assignments', [
        'id' => $assignment->id,
        'status' => 'declined',
        'reason' => 'Saya sedang sibuk dengan proyek lain.',
    ]);
});

it('prevents unauthorized user from accepting invitation', function () {
    // Arrange
    $reviewer = User::factory()->create();
    $otherUser = User::factory()->create();
    $registration = PembinaanRegistration::factory()->create();
    $assignment = ReviewerAssignment::create([
        'reviewer_id' => $reviewer->id,
        'registration_id' => $registration->id,
        'assigned_by' => User::factory()->create()->id,
        'status' => 'assigned',
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
    $registration = PembinaanRegistration::factory()->create();
    $assignment = ReviewerAssignment::create([
        'reviewer_id' => $reviewer->id,
        'registration_id' => $registration->id,
        'assigned_by' => User::factory()->create()->id,
        'status' => 'assigned',
    ]);

    // Act
    $response = $this->actingAs($otherUser)->post(route('review.decline', $assignment->id), [
        'reason' => 'Bukan tugas saya',
    ]);

    // Assert
    $response->assertStatus(403);
});
