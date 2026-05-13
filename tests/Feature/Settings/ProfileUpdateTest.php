<?php

use App\Models\User;

test('profile page is displayed', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    // User is soft deleted, so fresh() returns the soft-deleted record
    expect($user->fresh()->trashed())->toBeTrue();
});

test('correct password must be provided to delete account', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($user->fresh())->not->toBeNull();
});

// ─── Additional validation tests ──────────────────────────────────────────────

test('guest is redirected to login when accessing profile page', function () {
    $this->seedRoles();

    $this->get('/settings/profile')
        ->assertRedirect(route('login'));
});

test('profile update rejects email already taken by another user', function () {
    $this->seedRoles();
    $existing = User::factory()->user()->create(['email' => 'taken@example.com']);
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => 'taken@example.com',
        ])
        ->assertSessionHasErrors('email')
        ->assertRedirect('/settings/profile');
});

test('profile update accepts its own email without uniqueness error', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create(['email' => 'me@example.com']);

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Same Email User',
            'email' => 'me@example.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');
});

test('profile update rejects phone number exceeding 20 characters', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => str_repeat('1', 21),
        ])
        ->assertSessionHasErrors('phone');
});

test('profile update rejects position exceeding 100 characters', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'position' => str_repeat('A', 101),
        ])
        ->assertSessionHasErrors('position');
});

test('profile update saves phone and position fields', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => '+6281234567890',
            'position' => 'Senior Researcher',
        ])
        ->assertSessionHasNoErrors();

    $user->refresh();
    expect($user->phone)->toBe('+6281234567890');
    expect($user->position)->toBe('Senior Researcher');
});

test('profile update with valid scientific field assigns it correctly', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $field = \App\Models\ScientificField::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'scientific_field_id' => $field->id,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->scientific_field_id)->toBe($field->id);
});

test('profile update with nonexistent scientific field is rejected', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'scientific_field_id' => 99999,
        ])
        ->assertSessionHasErrors('scientific_field_id');
});

test('profile update requires name to be present', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => '',
            'email' => $user->email,
        ])
        ->assertSessionHasErrors('name');
});
