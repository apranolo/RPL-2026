<?php

use App\Models\Submission;
use App\Models\User;

// Catatan: test ini mengasumsikan model Submission (beserta factory) sudah
// ter-merge ke development. Lihat Opsi A/B/C pada blocker model di PR #106 & #110.

it('allows the author to cancel their own draft submission', function () {
    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->create(['status' => 'draft']);

    $this->actingAs($author)
        ->delete(route('submissions.cancel', $submission))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('success');

    $this->assertModelMissing($submission);
});

it('forbids cancelling a submission that is not a draft', function () {
    $author = User::factory()->create();

    $submission = Submission::factory()
        ->for($author, 'author')
        ->create(['status' => 'review']);

    $this->actingAs($author)
        ->delete(route('submissions.cancel', $submission))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertModelExists($submission);
});

it('forbids a user from cancelling another author\'s submission', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $submission = Submission::factory()
        ->for($owner, 'author')
        ->create(['status' => 'draft']);

    $this->actingAs($otherUser)
        ->delete(route('submissions.cancel', $submission))
        ->assertForbidden();

    $this->assertModelExists($submission);
});