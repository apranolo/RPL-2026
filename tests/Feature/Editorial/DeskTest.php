<?php

use App\Models\Journal;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/user/editorial/desk/inbox')->assertRedirect('/login');
});

test('unauthorized roles (like admin kampus) are forbidden from accessing editorial desk', function () {
    $this->seedRoles();
    $this->actingAs($user = User::factory()->adminKampus()->create());

    $this->get('/user/editorial/desk/inbox')->assertForbidden();
});

test('pengelola jurnal (user) can visit the editorial desk inbox', function () {
    $this->seedRoles();
    $this->actingAs($user = User::factory()->user()->create());

    $this->get('/user/editorial/desk/inbox')->assertOk();
});

test('editorial desk inbox displays correct counts of submissions per status', function () {
    $this->seedRoles();
    $editor = User::factory()->user()->create();
    $author = User::factory()->create();
    
    // Seed university and field first so JournalFactory works smoothly
    $journal = Journal::factory()->create(['user_id' => $editor->id]);

    // Create mock submissions with various statuses
    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Unassigned Submission',
        'status' => 'unassigned',
    ]);

    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Active Submission 1',
        'status' => 'active',
    ]);

    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Active Submission 2',
        'status' => 'active',
    ]);

    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Awaiting Decision Submission',
        'status' => 'awaiting_decision',
    ]);

    $this->actingAs($editor);

    $response = $this->get('/user/editorial/desk/inbox');

    $response->assertOk();
    
    // Verify inertia props contains correct counts
    $response->assertInertia(fn ($page) => $page
        ->component('Editorial/Desk/Inbox')
        ->has('counts')
        ->where('counts.unassigned', 1)
        ->where('counts.active', 2)
        ->where('counts.awaiting_decision', 1)
        ->where('counts.archived', 0)
    );
});

test('editorial desk inbox filters list using tab query parameter', function () {
    $this->seedRoles();
    $editor = User::factory()->user()->create();
    $author = User::factory()->create();
    $journal = Journal::factory()->create(['user_id' => $editor->id]);

    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Submission Unassigned',
        'status' => 'unassigned',
    ]);

    Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Submission Active',
        'status' => 'active',
    ]);

    $this->actingAs($editor);

    // Test with active tab
    $response = $this->get('/user/editorial/desk/inbox?tab=active');
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Editorial/Desk/Inbox')
        ->where('activeTab', 'active')
        ->has('submissions.data', 1)
        ->where('submissions.data.0.title', 'Submission Active')
    );

    // Test with default tab (unassigned)
    $responseDefault = $this->get('/user/editorial/desk/inbox');
    $responseDefault->assertOk();

    $responseDefault->assertInertia(fn ($page) => $page
        ->component('Editorial/Desk/Inbox')
        ->where('activeTab', 'unassigned')
        ->has('submissions.data', 1)
        ->where('submissions.data.0.title', 'Submission Unassigned')
    );
});
