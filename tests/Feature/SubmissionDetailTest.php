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
    test()->skip('Blocked: relasi reviewer()/statusHistories() belum ada di model Submission');

    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->create();

    $this->actingAs($author)
        ->get(route('submissions.show', $submission))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('Submission/Show')
                ->where('submission.id', $submission->id)
        );
});

it('forbids a user from viewing another author\'s submission', function () {
    test()->skip('Blocked: relasi reviewer()/statusHistories() belum ada di model Submission');

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $submission = Submission::factory()
        ->for($owner, 'author')
        ->create();

    $this->actingAs($otherUser)
        ->get(route('submissions.show', $submission))
        ->assertForbidden();
});

it('includes the status tracking history in the response', function () {
    test()->skip('Blocked: relasi statusHistories() belum ada di model Submission');

    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->has(StatusHistory::factory()->count(2), 'statusHistories')
        ->create();

    $this->actingAs($author)
        ->get(route('submissions.show', $submission))
        ->assertInertia(
            fn ($page) => $page->has('tracking', 2)
        );
});
