<?php

use App\Http\Middleware\RoleMiddleware;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(RoleMiddleware::class);
});

function createJournalManager(): User
{
    $role = Role::firstOrCreate(
        ['name' => Role::PENGELOLA_JURNAL],
        [
            'display_name' => 'Pengelola Jurnal',
            'description' => 'Journal Manager',
        ]
    );

    return User::factory()->create([
        'role_id' => $role->id,
    ]);
}

it('allows a valid final editorial decision', function () {

    $editor = createJournalManager();

    $submission = Submission::factory()->create();

    $response = $this
        ->actingAs($editor)
        ->from('/')
        ->post(
            route('editorial.final-decision', $submission),
            [
                'decision' => 'accept',
                'notes' => 'The manuscript is ready for publication.',
            ]
        );

    $response
        ->assertRedirect('/')
        ->assertSessionHasNoErrors()
        ->assertSessionHas(
            'success',
            'Final editorial decision has been validated.'
        );
});

it('allows accept decision without notes', function () {

    $editor = createJournalManager();

    $submission = Submission::factory()->create();

    $response = $this
        ->actingAs($editor)
        ->from('/')
        ->post(
            route('editorial.final-decision', $submission),
            [
                'decision' => 'accept',
            ]
        );

    $response
        ->assertRedirect('/')
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');
});

it('rejects invalid decision value', function () {

    $editor = createJournalManager();

    $submission = Submission::factory()->create();

    $response = $this
        ->actingAs($editor)
        ->from('/')
        ->post(
            route('editorial.final-decision', $submission),
            [
                'decision' => 'invalid',
                'notes' => 'Anything',
            ]
        );

    $response
        ->assertRedirect('/')
        ->assertSessionHasErrors('decision');
});

it('requires at least 50 characters when decision is reject', function () {

    $editor = createJournalManager();

    $submission = Submission::factory()->create();

    $response = $this
        ->actingAs($editor)
        ->from('/')
        ->post(
            route('editorial.final-decision', $submission),
            [
                'decision' => 'reject',
                'notes' => 'Too short',
            ]
        );

    $response
        ->assertRedirect('/')
        ->assertSessionHasErrors('notes');
});

it('accepts reject decision with valid notes', function () {

    $editor = createJournalManager();

    $submission = Submission::factory()->create();

    $response = $this
        ->actingAs($editor)
        ->from('/')
        ->post(
            route('editorial.final-decision', $submission),
            [
                'decision' => 'reject',
                'notes' => 'This manuscript requires major revisions because the methodology section lacks sufficient detail and the experimental results are incomplete.',
            ]
        );

    $response
        ->assertRedirect('/')
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');
});