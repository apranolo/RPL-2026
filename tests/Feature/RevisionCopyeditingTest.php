<?php

use App\Models\CopyeditingTask;
use App\Models\Journal;
use App\Models\RevisionRound;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('revision round and copyediting task models can be created and relate to submission', function () {
    $editor = User::factory()->create();
    $journal = Journal::factory()->create(['user_id' => $editor->id]);
    $author = User::factory()->create();

    $submission = Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Test Manuscript Title',
        'status' => 'submitted',
    ]);

    // Create RevisionRound
    $revision = RevisionRound::create([
        'id_submission' => $submission->id,
        'round_number' => 1,
        'due_date' => '2026-08-01',
        'editor_decision_note' => 'Please fix the methodology section.',
        'status' => 'Awaiting_Revision',
    ]);

    expect($revision->submission->id)->toBe($submission->id)
        ->and($revision->round_number)->toBe(1)
        ->and($revision->status)->toBe('Awaiting_Revision');

    // Create CopyeditingTask
    $copyeditor = User::factory()->create();
    $task = CopyeditingTask::create([
        'id_submission' => $submission->id,
        'id_copyeditor' => $copyeditor->id,
        'status' => 'Assigned',
        'editor_note' => 'Check formatting.',
    ]);

    expect($task->submission->id)->toBe($submission->id)
        ->and($task->copyeditor->id)->toBe($copyeditor->id)
        ->and($task->status)->toBe('Assigned');
});

test('only journal editor role can trigger notifyAuthor endpoint', function () {
    $editor = User::factory()->create();
    $editor->roles()->create(['role_id' => 3]); // Assuming 3 is Pengelola Jurnal, or let's mock role checking.
    // Wait, let's verify if role checking uses pivot or user hasRole method.
    // Our custom rules say: "Always use User model helper methods like $user->hasRole($role)".
    // So if the seeder defines role_id legacy or pivot, let's assign the role properly.
    // Let's create a role named 'Pengelola Jurnal' and assign it, or assign role_id.

    $journal = Journal::factory()->create(['user_id' => $editor->id]);
    $author = User::factory()->create();

    $submission = Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Test Manuscript Title',
        'status' => 'submitted',
    ]);

    $data = [
        'status' => 'Awaiting_Revision',
        'editor_decision_note' => 'Need revisions.',
        'due_date' => '2026-08-01',
    ];

    // Unauthorized user (e.g. Author) gets 403 Forbidden
    $response = $this->actingAs($author)
        ->postJson(route('editorial.revision.notify-author', $submission->id), $data);

    $response->assertStatus(403);

    // Authorized user (Pengelola Jurnal) gets redirect back on success
    // Assign role to editor
    $role = Role::firstOrCreate(['id' => 3, 'name' => 'Pengelola Jurnal']);
    $editor->roles()->syncWithoutDetaching([$role->id]);

    $responseSuccess = $this->actingAs($editor)
        ->from(route('dashboard')) // back redirect target
        ->postJson(route('editorial.revision.notify-author', $submission->id), $data);

    $responseSuccess->assertRedirect(route('dashboard'));

    $revision = RevisionRound::where('id_submission', $submission->id)->first();
    expect($revision)->not->toBeNull()
        ->and($revision->editor_decision_note)->toBe('Need revisions.');
});
