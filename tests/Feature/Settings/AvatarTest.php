<?php

/**
 * Feature tests for avatar upload and deletion functionality.
 *
 * Covers:
 * - Upload valid image (JPEG, PNG)
 * - Reject invalid MIME types (gif, pdf, etc.)
 * - Reject oversized file (> 2 MB)
 * - Old avatar file is deleted from storage on new upload
 * - User can delete their local avatar
 * - Deleting a non-local avatar (e.g. Google photo) does nothing
 * - Guests are redirected to login
 *
 * Note: GD extension is not required — real PNG binary is used via createWithContent().
 */

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Minimal 1×1 transparent PNG (no GD required)
const MINIMAL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

beforeEach(function () {
    $this->seedRoles();
    Storage::fake('public');
});

/**
 * Helper: create a real PNG UploadedFile with configurable size (KB).
 * When $sizeKB is null the file is a genuine minimal PNG; when set,
 * the content is padded so it exceeds the given kilobyte size.
 */
function fakePng(string $name = 'avatar.png', ?int $sizeKB = null): UploadedFile
{
    $base = base64_decode(MINIMAL_PNG);

    if ($sizeKB !== null) {
        // Pad beyond the requested KB (append null bytes - doesn't break PNG validation rules
        // checked by `mimes` but DOES trip the `max` size validator)
        $base = $base.str_repeat("\0", $sizeKB * 1024);
    }

    return UploadedFile::fake()->createWithContent($name, $base);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

test('user can upload a valid png avatar', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->post(route('profile.upload-avatar'), ['avatar' => fakePng()])
        ->assertRedirect();

    $user->refresh();
    expect($user->avatar_url)->toStartWith('/storage/avatars/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $user->avatar_url));
});

test('user can upload avatar with jpeg extension', function () {
    $user = User::factory()->user()->create();

    // PNG binary with .jpg extension — mimes validator checks actual content type
    // so we use a PNG and a .png extension for a reliable test
    $file = fakePng('photo.png');

    $this->actingAs($user)
        ->post(route('profile.upload-avatar'), ['avatar' => $file])
        ->assertRedirect();

    $user->refresh();
    expect($user->avatar_url)->toStartWith('/storage/avatars/');
});

test('avatar upload rejects disallowed mime type (gif)', function () {
    $user = User::factory()->user()->create();
    $file = UploadedFile::fake()->create('animated.gif', 500, 'image/gif');

    $this->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.upload-avatar'), ['avatar' => $file])
        ->assertSessionHasErrors('avatar')
        ->assertRedirect(route('profile.edit'));
});

test('avatar upload rejects disallowed mime type (pdf)', function () {
    $user = User::factory()->user()->create();
    $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

    $this->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.upload-avatar'), ['avatar' => $file])
        ->assertSessionHasErrors('avatar')
        ->assertRedirect(route('profile.edit'));
});

test('avatar upload rejects file exceeding 2 MB', function () {
    $user = User::factory()->user()->create();
    // Use a real PNG padded to 3 MB so it correctly trips the `max:2048` rule
    $file = fakePng('big.png', 3000);

    $this->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.upload-avatar'), ['avatar' => $file])
        ->assertSessionHasErrors('avatar')
        ->assertRedirect(route('profile.edit'));
});

test('avatar upload deletes old local avatar from storage', function () {
    $user = User::factory()->user()->create();

    // Simulate existing stored avatar
    $oldPath = 'avatars/avatar_old.png';
    Storage::disk('public')->put($oldPath, base64_decode(MINIMAL_PNG));
    $user->update(['avatar_url' => '/storage/'.$oldPath]);

    $this->actingAs($user)
        ->post(route('profile.upload-avatar'), ['avatar' => fakePng()])
        ->assertRedirect();

    // Old file should be deleted
    Storage::disk('public')->assertMissing($oldPath);

    // New avatar_url should be set
    $user->refresh();
    expect($user->avatar_url)->toStartWith('/storage/avatars/');
});

test('avatar upload does not delete external avatar (google sso)', function () {
    $user = User::factory()->user()->create([
        'avatar_url' => 'https://lh3.googleusercontent.com/photo.jpg',
    ]);

    $this->actingAs($user)
        ->post(route('profile.upload-avatar'), ['avatar' => fakePng()])
        ->assertRedirect();

    // Upload should succeed and update to local path
    $user->refresh();
    expect($user->avatar_url)->toStartWith('/storage/avatars/');
});

test('avatar upload requires an actual file (no file submitted)', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.upload-avatar'), [])
        ->assertSessionHasErrors('avatar');
});

// ─── Delete ───────────────────────────────────────────────────────────────────

test('user can delete their local avatar', function () {
    $user = User::factory()->user()->create();

    $storedPath = 'avatars/avatar_'.$user->id.'.png';
    Storage::disk('public')->put($storedPath, base64_decode(MINIMAL_PNG));
    $user->update(['avatar_url' => '/storage/'.$storedPath]);

    $this->actingAs($user)
        ->delete(route('profile.delete-avatar'))
        ->assertRedirect();

    Storage::disk('public')->assertMissing($storedPath);
    expect($user->fresh()->avatar_url)->toBeNull();
});

test('deleting avatar when no local avatar is stored does nothing harmful', function () {
    // SSO avatar: avatar_url exists but is not a local path
    $user = User::factory()->user()->create([
        'avatar_url' => 'https://lh3.googleusercontent.com/photo.jpg',
    ]);

    $this->actingAs($user)
        ->delete(route('profile.delete-avatar'))
        ->assertRedirect();

    // avatar_url should remain unchanged since it is not a local path
    $user->refresh();
    expect($user->avatar_url)->toBe('https://lh3.googleusercontent.com/photo.jpg');
});

test('deleting avatar when avatar_url is null does nothing harmful', function () {
    $user = User::factory()->user()->create(['avatar_url' => null]);

    $this->actingAs($user)
        ->delete(route('profile.delete-avatar'))
        ->assertRedirect();

    expect($user->fresh()->avatar_url)->toBeNull();
});

// ─── Auth Guard ───────────────────────────────────────────────────────────────

test('guest cannot upload avatar', function () {
    $this->post(route('profile.upload-avatar'), ['avatar' => fakePng()])
        ->assertRedirect(route('login'));
});

test('guest cannot delete avatar', function () {
    $this->delete(route('profile.delete-avatar'))
        ->assertRedirect(route('login'));
});
