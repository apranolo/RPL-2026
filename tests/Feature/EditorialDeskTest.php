<?php

/**
 * Feature Test: EditorialDeskTest
 *
 * Menguji alur desk review dan penugasan Section Editor
 * pada modul Editorial Desk.
 */

use App\Models\EditorialAssignment;
use App\Models\Submission;
use App\Models\User;

beforeEach(function () {
    // Buat user editor dan submission untuk testing
    $this->editor = User::factory()->create();
    $this->submission = Submission::factory()->create(['status' => 'pending']);
});

// -----------------------------------------------------------------------
// Pengujian Akses Route
// -----------------------------------------------------------------------

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

// -----------------------------------------------------------------------
// Pengujian Assign Editor
// -----------------------------------------------------------------------

test('editor berhasil ditugaskan ke submission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('editorial.desk.assign-editor', $this->submission), [
            'editor_id' => $this->editor->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('editorial_assignments', [
        'submission_id' => $this->submission->id,
        'editor_id'     => $this->editor->id,
        'status'        => 'assigned',
    ]);
});

test('editor yang sama tidak bisa ditugaskan dua kali ke submission yang sama', function () {
    $user = User::factory()->create();

    EditorialAssignment::create([
        'editor_id'     => $this->editor->id,
        'submission_id' => $this->submission->id,
        'assigned_by'   => $user->id,
        'status'        => 'assigned',
    ]);

    $this->actingAs($user)
        ->post(route('editorial.desk.assign-editor', $this->submission), [
            'editor_id' => $this->editor->id,
        ])
        ->assertSessionHasErrors('editor_id');
});

test('assign editor gagal jika editor_id tidak dikirim', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('editorial.desk.assign-editor', $this->submission), [])
        ->assertSessionHasErrors('editor_id');
});

// -----------------------------------------------------------------------
// Pengujian Desk Review
// -----------------------------------------------------------------------

test('submission berhasil diterima', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision' => 'approved',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('submissions', [
        'id'     => $this->submission->id,
        'status' => 'approved',
    ]);
});

test('submission berhasil ditolak dengan catatan', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision'         => 'rejected',
            'rejection_reason' => 'Naskah tidak sesuai scope jurnal.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('submissions', [
        'id'               => $this->submission->id,
        'status'           => 'rejected',
        'rejection_reason' => 'Naskah tidak sesuai scope jurnal.',
    ]);
});

test('penolakan gagal jika catatan tidak diisi', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision'         => 'rejected',
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');
});

test('submission yang sudah diproses tidak bisa diubah lagi', function () {
    $user = User::factory()->create();

    $this->submission->update(['status' => 'approved']);

    $this->actingAs($user)
        ->post(route('editorial.desk.desk-review', $this->submission), [
            'decision' => 'rejected',
            'rejection_reason' => 'Test.',
        ])
        ->assertSessionHas('error');
});