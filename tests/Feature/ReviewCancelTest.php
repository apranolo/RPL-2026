<?php

use App\Models\Journal;
use App\Models\ReviewAssignment;
use App\Models\Role;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Review Assignment Cancellation
|--------------------------------------------------------------------------
|
| Depends on App\Models\ReviewAssignment and App\Models\Submission, both
| now merged into `development` (Kelas G / Modul 4 - Peer Review OJS,
| ReviewAssignment by Agnes Putri Alfalahi; Submission by Dzaky).
|
| Schema notes (per the actual merged migrations, NOT what was originally
| assumed in earlier revisions of this PR):
|   - review_assignments.status enum is: Pending, Accepted, Declined,
|     Completed, Cancelled (default 'Pending' -- there is no 'Invited').
|   - the cancellation-reason column is `decline_reason` (not
|     `declined_reason`).
|
| No ReviewAssignmentPolicy exists upstream yet, so ReviewAssignmentController
| relies on route-level role middleware (Pengelola Jurnal) instead of
| $this->authorize(). These tests reflect that: they check role-based
| access via the route middleware, not policy-based access.
|
| Submission has no factory yet, so it's created inline via its
| fillable fields (journal_id, author_id, title, status) instead of
| Submission::factory().
*/

beforeEach(function () {
    $this->seedRoles();

    // Ensure Editor and Reviewer roles exist
    Role::firstOrCreate(
        ['name' => 'Editor'],
        [
            'display_name' => 'Editor',
            'description' => 'Editor',
        ]
    );
    Role::firstOrCreate(
        ['name' => Role::REVIEWER],
        [
            'display_name' => 'Reviewer',
            'description' => 'Reviewer',
        ]
    );

    $editorRole = Role::where('name', 'Editor')->first();
    $this->editor = User::factory()->create([
        'role_id' => $editorRole->id,
        'is_active' => true,
    ]);
    $this->editor->roles()->syncWithoutDetaching([$editorRole->id]);

    $reviewerRole = Role::where('name', Role::REVIEWER)->first();
    $this->reviewer = User::factory()->create([
        'role_id' => $reviewerRole->id,
        'is_active' => true,
    ]);
    $this->reviewer->roles()->syncWithoutDetaching([$reviewerRole->id]);

    $userRole = Role::where('name', Role::USER)->first();
    $this->plainUser = User::factory()->create([
        'role_id' => $userRole->id,
        'is_active' => true,
    ]);
    $this->plainUser->roles()->syncWithoutDetaching([$userRole->id]);
});

it('blocks unauthenticated users from cancelling a review assignment', function () {
    $assignment = createPendingAssignment($this->reviewer);

    $response = $this->post(route('review-assignments.cancel', $assignment->id), [
        'reason' => 'No longer needed',
    ]);

    // Outer ['auth'] middleware should redirect guests to login rather
    // than allow the cancellation to go through.
    $response->assertRedirect(route('login'));
    expect($assignment->fresh()->status)->toBe('Pending');
});

it('blocks users without the Editor role from cancelling', function () {
    $assignment = createPendingAssignment($this->reviewer);

    $response = actingAs($this->plainUser)->post(route('review-assignments.cancel', $assignment->id), [
        'reason' => 'Trying to cancel without permission',
    ]);

    $response->assertForbidden();
    expect($assignment->fresh()->status)->toBe('Pending');
});

it('allows an Editor to cancel a Pending assignment', function () {
    $assignment = createPendingAssignment($this->reviewer);

    $response = actingAs($this->editor)->post(route('review-assignments.cancel', $assignment->id), [
        'reason' => 'Reviewer no longer available',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($assignment->fresh())
        ->status->toBe('Cancelled')
        ->decline_reason->toBe('Reviewer no longer available');
});

it('does not allow cancelling an assignment that already progressed past Pending', function () {
    $assignment = createPendingAssignment($this->reviewer, status: 'Accepted');

    $response = actingAs($this->editor)->post(route('review-assignments.cancel', $assignment->id), [
        'reason' => 'Too late',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect($assignment->fresh()->status)->toBe('Accepted');
});

it('rejects a cancellation reason that is too short', function () {
    $assignment = createPendingAssignment($this->reviewer);

    // 'No' hanya 2 karakter — di bawah minimum 3 karakter.
    $response = actingAs($this->editor)->post(route('review-assignments.cancel', $assignment->id), [
        'reason' => 'No',
    ]);

    $response->assertSessionHasErrors('reason');
    // Status tidak berubah karena validasi gagal.
    expect($assignment->fresh()->status)->toBe('Pending');
});


/**
 * Create a 'Pending' review assignment attached to a freshly-created
 * submission. Submission has no factory yet, so it's built manually from
 * its known fillable fields.
 */
function createPendingAssignment(User $reviewer, string $status = 'Pending'): ReviewAssignment
{
    $university = University::factory()->create();
    $journal = Journal::factory()->create(['university_id' => $university->id]);
    $author = User::factory()->create();

    $submission = Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Test Submission',
        'status' => 'unassigned',
    ]);

    return ReviewAssignment::create([
        'submission_id' => $submission->id,
        'reviewer_id' => $reviewer->id,
        'round' => 1,
        'status' => $status,
        'due_date' => now()->addDays(14),
    ]);
}