<?php

/**
 * Feature Test: DeskReviewTest
 *
 * Menguji alur desk review dan penugasan Section Editor
 * pada modul Editorial Desk.
 *
 * @author 2300018400
 */

use App\Models\EditorialAssignment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->editor = User::factory()->create();
    $this->submission = Submission::factory()->create(['status' => 'pending']);
});

test('guest tidak bisa mengakses halaman desk review', function () {
    $response = $this->get(route('editorial.desk.review', $this->submission));
    $response->assertRedirect(route('login'));
});

test('user yang login bisa mengakses halaman desk review', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)
        ->get(route('editorial.desk.review', $this->submission));
    $response->assertStatus(200);
});

test('editor berhasil ditugaskan ke submission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->post(route('editorial.desk.assign-editor', $this->submission), [
            'editor_id' => $this->editor->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('editorial_assignments', [
        'submission_id' => $this->submission->id,
        'editor_id' => $this->editor->id,
        'status' => 'assigned',
    ]);
});

test('editor yang sama tidak bisa ditugaskan dua kali', function () {
    $user = User::factory()->create();
    EditorialAssignment::create([
        'editor_id' => $this->editor->id,
        'submission_id' => $this->submission->id,
        'assigned_by' => $user->id,
        'status' => 'assigned',
    ]);

    $this->actingAs($user)
        ->post(route('editorial.desk.assign-editor', $this->submission), [
            'editor_id' => $this->editor->id,
        ])
        ->assertSessionHasErrors('editor_id');
});

test('submission berhasil diterima dengan Accept_For_Review', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision' => 'Accept_For_Review',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('submissions', [
        'id' => $this->submission->id,
        'status' => 'Accept_For_Review',
    ]);
});

test('submission berhasil ditolak dengan Desk_Reject dan catatan', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision' => 'Desk_Reject',
            'rejection_reason' => 'Naskah tidak sesuai scope jurnal.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('submissions', [
        'id' => $this->submission->id,
        'status' => 'Desk_Reject',
    ]);
});

test('penolakan gagal jika catatan tidak diisi', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision' => 'Desk_Reject',
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');
});
