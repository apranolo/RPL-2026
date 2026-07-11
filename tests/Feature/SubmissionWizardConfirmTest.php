<?php

use App\Models\Journal;
use App\Models\Submission;
use App\Models\SubmissionContributor;
use App\Models\SubmissionFile;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
    $this->withoutVite();
});

test('user can view step 5 confirm page', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test', 'paper'],
        'language' => 'en',
        'status' => 'Draft',
    ]);

    // Add main manuscript file
    SubmissionFile::create([
        'submission_id' => $submission->id,
        'file_path' => 'submissions/main.pdf',
        'file_name' => 'main.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'file_type' => 'ManuscriptMain',
    ]);

    // Add co-author
    SubmissionContributor::create([
        'submission_id' => $submission->id,
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'is_corresponding' => false,
    ]);

    $this->actingAs($user)
        ->get(route('user.submission-wizard.confirm', $submission->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Submission/Wizard/Step5Confirm'));
});

test('guest cannot access confirm page', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();
    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test'],
        'status' => 'Draft',
    ]);

    $this->get(route('user.submission-wizard.confirm', $submission->id))
        ->assertRedirect(route('login'));
});

test('user cannot view confirm page of another user submission', function () {
    $user1 = User::factory()->user()->create();
    $user2 = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user1->id,
        'journal_id' => $journal->id,
        'title' => 'User 1 Paper',
        'description' => 'Abstract',
        'keywords' => ['test'],
        'status' => 'Draft',
    ]);

    $this->actingAs($user2)
        ->get(route('user.submission-wizard.confirm', $submission->id))
        ->assertForbidden();
});

test('user cannot view confirm page if status is not Draft', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test'],
        'status' => 'Submitted',
    ]);

    $this->actingAs($user)
        ->get(route('user.submission-wizard.confirm', $submission->id))
        ->assertRedirect(route('user.profil.index'));
});

test('user can submit submission successfully', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test'],
        'status' => 'Draft',
    ]);

    SubmissionFile::create([
        'submission_id' => $submission->id,
        'file_path' => 'submissions/main.pdf',
        'file_name' => 'main.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'file_type' => 'ManuscriptMain',
    ]);

    SubmissionContributor::create([
        'submission_id' => $submission->id,
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'is_corresponding' => false,
    ]);

    $this->actingAs($user)
        ->post(route('user.submission-wizard.final-submit', $submission->id), [
            'confirm_submission' => true,
        ])
        ->assertRedirect(route('user.profil.index'))
        ->assertSessionHas('success');

    expect($submission->fresh()->status)->toBe('Submitted');
});

test('user cannot final submit without confirming', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test'],
        'status' => 'Draft',
    ]);

    $this->actingAs($user)
        ->post(route('user.submission-wizard.final-submit', $submission->id), [
            'confirm_submission' => false,
        ])
        ->assertSessionHasErrors(['confirm_submission']);
});

test('user cannot final submit another user submission', function () {
    $user1 = User::factory()->user()->create();
    $user2 = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user1->id,
        'journal_id' => $journal->id,
        'title' => 'User 1 Paper',
        'description' => 'Abstract',
        'keywords' => ['test'],
        'status' => 'Draft',
    ]);

    $this->actingAs($user2)
        ->post(route('user.submission-wizard.final-submit', $submission->id), [
            'confirm_submission' => true,
        ])
        ->assertForbidden();
});

test('user cannot final submit if status is not Draft', function () {
    $user = User::factory()->user()->create();
    $journal = Journal::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'journal_id' => $journal->id,
        'title' => 'Test Paper Title',
        'description' => 'Test Paper Abstract',
        'keywords' => ['test'],
        'status' => 'Submitted',
    ]);

    SubmissionFile::create([
        'submission_id' => $submission->id,
        'file_path' => 'submissions/main.pdf',
        'file_name' => 'main.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'file_type' => 'ManuscriptMain',
    ]);

    SubmissionContributor::create([
        'submission_id' => $submission->id,
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'is_corresponding' => false,
    ]);

    $this->actingAs($user)
        ->post(route('user.submission-wizard.final-submit', $submission->id), [
            'confirm_submission' => true,
        ])
        ->assertRedirect(route('user.profil.index'))
        ->assertSessionHasErrors(['error']);
});
