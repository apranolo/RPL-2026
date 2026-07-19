<?php

use App\Models\StatusHistory;
use App\Models\Submission;
use App\Models\User;

// Catatan: test ini mengasumsikan model Submission (beserta factory dan
// relasi author/reviewer/statusHistories) sudah ter-merge ke development.
// Lihat Opsi A/B/C pada blocker model di PR #106 & #110.
//
// STATUS PER HARI INI: relasi reviewer() dan statusHistories() BELUM ada
// di app/Models/Submission.php (bukan tugas PR ini). Karena
// SubmissionController::show() memanggil $submission->load([...]) SEBELUM
// pengecekan otorisasi, semua test di bawah yang memanggil rute
// submissions.show akan melempar RelationNotFoundException sampai relasi
// itu ditambahkan — bukan cuma test yang menyentuh tracking. Ditandai
// ->skip(), bukan dihapus, supaya otomatis aktif begitu relasinya ada.

it('allows the author to view their own submission detail', function () {
    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->create();

    $this->actingAs($author)
        ->get(route('submissions.show', $submission))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Submission/Show')
            ->has('submission')
            ->where('submission.id', $submission->id)
        );
})->skip('Blocked: relasi reviewer()/statusHistories() belum ada di model Submission');

it('forbids a user from viewing another author\'s submission', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $submission = Submission::factory()
        ->for($owner, 'author')
        ->create();

    $this->actingAs($otherUser)
        ->get(route('submissions.show', $submission))
        ->assertForbidden();
})->skip('Blocked: relasi reviewer()/statusHistories() belum ada di model Submission');

it('includes the status tracking history in the response', function () {
    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->has(StatusHistory::factory()->count(2), 'statusHistories')
        ->create();

    $this->actingAs($author)
        ->get(route('submissions.show', $submission))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tracking', 2)
        );
})->skip('Blocked: relasi statusHistories() belum ada di model Submission');
