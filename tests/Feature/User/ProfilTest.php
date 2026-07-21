<?php

/**
 * Feature tests for the User-area Profile Management.
 *
 * Covers:
 *   - Viewing the profil dashboard (/user/profil)
 *   - Viewing the profil edit page (/user/profil/edit)
 *   - Updating profile info from the user area (PATCH /user/profil/edit)
 *   - Role-based access control (Admin Kampus / Super Admin cannot access)
 *   - Validation errors on update
 *   - Email verification reset on email change
 */

use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
});

// ─── Profil Dashboard (index) ─────────────────────────────────────────────────

test('user can view profil dashboard', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->get(route('user.profil.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('User/Profil/Index'));
});

test('guest is redirected to login from profil dashboard', function () {
    $this->get(route('user.profil.index'))
        ->assertRedirect(route('login'));
});

test('admin kampus cannot access user profil dashboard', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create();

    $this->actingAs($admin)
        ->get(route('user.profil.index'))
        ->assertForbidden();
});

test('super admin cannot access user profil dashboard', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get(route('user.profil.index'))
        ->assertForbidden();
});

test('profil dashboard response contains user data', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
    ]);

    $this->actingAs($user)
        ->get(route('user.profil.index'))
        ->assertInertia(fn ($page) => $page
            ->has('user')
            ->where('user.name', 'Budi Santoso')
            ->where('user.email', 'budi@example.com')
            ->has('statistics')
            ->has('journals')
        );
});

// ─── Profil Edit Page (GET) ────────────────────────────────────────────────────

test('user can view profil edit page', function () {
    $user = User::factory()->user()->create();

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('user.profil.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('User/Profil/Edit'));
});

test('guest is redirected to login from profil edit page', function () {
    $this->get(route('user.profil.edit'))
        ->assertRedirect(route('login'));
});

test('admin kampus cannot access user profil edit page', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create();

    $this->actingAs($admin)
        ->get(route('user.profil.edit'))
        ->assertForbidden();
});

test('profil edit page includes scientific fields', function () {
    $user = User::factory()->user()->create();
    ScientificField::factory()->create(['name' => 'Teknik Informatika', 'is_active' => true]);

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('user.profil.edit'))
        ->assertInertia(fn ($page) => $page
            ->has('scientificFields')
        );
});

// ─── Profil Update (PATCH) ─────────────────────────────────────────────────────

test('user can update their profile from user area', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->patch(route('user.profil.update'), [
            'name' => 'Ahmad Fauzi',
            'email' => $user->email,
            'phone' => '+6281999888777',
            'position' => 'Dosen Tetap',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('user.profil.index'));

    $user->refresh();
    expect($user->name)->toBe('Ahmad Fauzi');
    expect($user->phone)->toBe('+6281999888777');
    expect($user->position)->toBe('Dosen Tetap');
});

test('user profil update resets email verification when email changes', function () {
    $user = User::factory()->user()->create([
        'email' => 'original@example.com',
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->patch(route('user.profil.update'), [
            'name' => $user->name,
            'email' => 'newemail@example.com',
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->email_verified_at)->toBeNull();
});

test('user profil update preserves email verification when email is unchanged', function () {
    $verifiedAt = now()->subDays(7);
    $user = User::factory()->user()->create([
        'email' => 'stable@example.com',
        'email_verified_at' => $verifiedAt,
    ]);

    $this->actingAs($user)
        ->patch(route('user.profil.update'), [
            'name' => 'New Name',
            'email' => 'stable@example.com',
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->email_verified_at)->not->toBeNull();
});

test('user profil update rejects empty name', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('user.profil.edit'))
        ->patch(route('user.profil.update'), [
            'name' => '',
            'email' => $user->email,
        ])
        ->assertSessionHasErrors('name');
});

test('user profil update rejects duplicate email', function () {
    $other = User::factory()->user()->create(['email' => 'taken@example.com']);
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('user.profil.edit'))
        ->patch(route('user.profil.update'), [
            'name' => $user->name,
            'email' => 'taken@example.com',
        ])
        ->assertSessionHasErrors('email');
});

test('user profil update rejects phone exceeding 20 characters', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('user.profil.edit'))
        ->patch(route('user.profil.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => str_repeat('0', 21),
        ])
        ->assertSessionHasErrors('phone');
});

test('user profil update rejects position exceeding 100 characters', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('user.profil.edit'))
        ->patch(route('user.profil.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'position' => str_repeat('X', 101),
        ])
        ->assertSessionHasErrors('position');
});

test('user profil update with valid scientific field saves correctly', function () {
    $user = User::factory()->user()->create();
    $field = ScientificField::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('user.profil.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'scientific_field_id' => $field->id,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->scientific_field_id)->toBe($field->id);
});

test('user profil update redirects to profil index on success', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->patch(route('user.profil.update'), [
            'name' => 'Test Redirect',
            'email' => $user->email,
        ])
        ->assertRedirect(route('user.profil.index'));
});

test('guest cannot submit user profil update', function () {
    $this->patch(route('user.profil.update'), [
        'name' => 'Hacker',
        'email' => 'hacker@example.com',
    ])
        ->assertRedirect(route('login'));
});

test('admin kampus cannot submit user profil update', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create();

    $this->actingAs($admin)
        ->patch(route('user.profil.update'), [
            'name' => $admin->name,
            'email' => $admin->email,
        ])
        ->assertForbidden();
});

// ─── Notifications ────────────────────────────────────────────────────────────

test('user can mark a notification as read', function () {
    $user = User::factory()->user()->create();

    // Create a database notification
    $user->notify(new \App\Notifications\JournalApprovedNotification(
        \App\Models\Journal::factory()->for($user)->create()
    ));

    $notification = $user->notifications()->first();

    $this->actingAs($user)
        ->post(route('user.profil.notifications.read', $notification->id))
        ->assertRedirect();

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
})->skip(fn () => ! class_exists(\App\Notifications\JournalApprovedNotification::class), 'JournalApprovedNotification does not exist');

test('user can mark all notifications as read', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->post(route('user.profil.notifications.read-all'))
        ->assertRedirect();
});
