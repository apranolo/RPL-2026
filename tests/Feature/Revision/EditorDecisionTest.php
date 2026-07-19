<?php

use App\Models\Journal;
use App\Models\RevisionRound;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSubmissionWithRevision(User $author): array
{
    $journal = Journal::factory()->create(['user_id' => $author->id]);

    $submission = Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Test Manuscript Title',
        'status' => 'submitted',
    ]);

    $revision = RevisionRound::create([
        'id_submission' => $submission->id,
        'round_number' => 1,
        'due_date' => now()->addDays(14),
        'status' => 'Submitted',
    ]);

    return [$submission, $revision];
}

test('unauthorized user cannot decide on a revision', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    [$submission, $revision] = makeSubmissionWithRevision($author);

    // User dengan role Admin Kampus (bukan User/Super Admin) mencoba akses endpoint decide
    $unauthorizedUser = User::factory()->adminKampus()->create();

    $response = $this->actingAs($unauthorizedUser)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Approved']
    );

    $response->assertForbidden();

    expect($revision->fresh()->status)->toBe('Submitted');
});

test('guest cannot decide on a revision', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    [, $revision] = makeSubmissionWithRevision($author);

    $response = $this->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Approved']
    );

    $response->assertRedirect(route('login'));
});

test('editor can approve a revision', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    $editor = User::factory()->user()->create();
    [, $revision] = makeSubmissionWithRevision($author);

    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Approved']
    );

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($revision->fresh()->status)->toBe('Approved');
});

test('editor rejecting a revision requires notes', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    $editor = User::factory()->user()->create();
    [, $revision] = makeSubmissionWithRevision($author);

    // Tanpa notes — harus gagal validasi
    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Rejected']
    );

    $response->assertSessionHasErrors('notes');
    expect($revision->fresh()->status)->toBe('Submitted');

    // Dengan notes — harus berhasil
    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Rejected', 'notes' => 'Metodologi tidak sesuai standar jurnal.']
    );

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $revision->refresh();
    expect($revision->status)->toBe('Rejected')
        ->and($revision->editor_decision_note)->toBe('Metodologi tidak sesuai standar jurnal.');
});

test('editor requesting more revision requires notes and updates status correctly', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    $editor = User::factory()->user()->create();
    [, $revision] = makeSubmissionWithRevision($author);

    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'Awaiting_Revision', 'notes' => 'Mohon perbaiki bagian pembahasan.']
    );

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $revision->refresh();
    expect($revision->status)->toBe('Awaiting_Revision')
        ->and($revision->editor_decision_note)->toBe('Mohon perbaiki bagian pembahasan.');
});

test('decision field is required and must be a valid enum value', function () {
    $this->seedRoles();

    $author = User::factory()->user()->create();
    $editor = User::factory()->user()->create();
    [, $revision] = makeSubmissionWithRevision($author);

    // Kosong
    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        []
    );
    $response->assertSessionHasErrors('decision');

    // Value tidak valid
    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', $revision->id_round),
        ['decision' => 'invalid_value']
    );
    $response->assertSessionHasErrors('decision');
});

test('deciding on a non-existent revision returns 404', function () {
    $this->seedRoles();

    $editor = User::factory()->user()->create();

    $response = $this->actingAs($editor)->post(
        route('user.editorial.revision.decide', 999999),
        ['decision' => 'Approved']
    );

    $response->assertNotFound();
});
