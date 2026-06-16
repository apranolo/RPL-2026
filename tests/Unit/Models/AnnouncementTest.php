<?php

use App\Models\Announcement;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

function announcementPayload(array $overrides = []): array
{
    return array_merge([
        'university_id' => University::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'title' => 'Sistem Update - Maintenance Terjadwal',
        'content' => 'Kami akan melakukan maintenance sistem pada tanggal 15 Mei 2026 pukul 22:00 - 02:00 WIB.',
        'description' => 'Maintenance terjadwal untuk optimalisasi performa sistem',
        'published_at' => now()->format('Y-m-d H:i'),
        'expires_at' => now()->addDays(30)->format('Y-m-d H:i'),
        'is_active' => 1,
        'is_featured' => 0,
    ], $overrides);
}

function createAnnouncement(array $overrides = []): Announcement
{
    return Announcement::create(announcementPayload($overrides));
}

it('can create announcement with valid data', function () {
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $announcement = createAnnouncement([
        'university_id' => $university->id,
        'user_id' => $user->id,
    ]);

    expect($announcement->title)->toBe('Sistem Update - Maintenance Terjadwal');
    expect($announcement->is_active)->toBeTrue();
    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'university_id' => $university->id,
        'user_id' => $user->id,
    ]);
});

it('generates unique slug automatically', function () {
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $announcement1 = Announcement::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'title' => 'Breaking News',
        'content' => 'Content 1',
    ]);

    $announcement2 = Announcement::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'title' => 'Breaking News',
        'content' => 'Content 2',
    ]);

    expect($announcement1->slug)->toBe('breaking-news');
    expect($announcement2->slug)->toBe('breaking-news-1');
});

it('casts attributes correctly', function () {
    $announcement = createAnnouncement([
        'published_at' => now()->subDay()->format('Y-m-d H:i'),
        'expires_at' => now()->addDays(1)->format('Y-m-d H:i'),
    ]);

    expect($announcement->published_at)->toBeInstanceOf(Illuminate\Support\Carbon::class);
    expect($announcement->expires_at)->toBeInstanceOf(Illuminate\Support\Carbon::class);
    expect($announcement->is_active)->toBeTrue();
    expect($announcement->is_featured)->toBeBool();
});

it('filters announcements by university', function () {
    $university1 = University::factory()->create();
    $university2 = University::factory()->create();

    createAnnouncement(['university_id' => $university1->id]);
    createAnnouncement(['university_id' => $university1->id]);
    createAnnouncement(['university_id' => $university1->id]);
    createAnnouncement(['university_id' => $university2->id]);
    createAnnouncement(['university_id' => $university2->id]);

    $results = Announcement::forUniversity($university1->id)->get();

    expect($results)->toHaveCount(3);
    expect($results->every(fn ($a) => $a->university_id === $university1->id))->toBeTrue();
});

it('filters active announcements only', function () {
    $university = University::factory()->create();

    createAnnouncement(['university_id' => $university->id, 'is_active' => true]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => true]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => false]);

    $results = Announcement::active()->get();

    expect($results)->toHaveCount(2);
    expect($results->every(fn ($a) => $a->is_active === true))->toBeTrue();
});

it('filters featured announcements', function () {
    $university = University::factory()->create();

    createAnnouncement(['university_id' => $university->id, 'is_featured' => true]);
    createAnnouncement(['university_id' => $university->id, 'is_featured' => false]);
    createAnnouncement(['university_id' => $university->id, 'is_featured' => false]);

    $results = Announcement::featured()->get();

    expect($results)->toHaveCount(1);
    expect($results->first()->is_featured)->toBeTrue();
});

it('filters published announcements only', function () {
    $university = University::factory()->create();

    createAnnouncement(['university_id' => $university->id, 'published_at' => now()->subDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'published_at' => now()->subDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'published_at' => now()->addDays(5)->format('Y-m-d H:i')]);

    $results = Announcement::published()->get();

    expect($results)->toHaveCount(2);
    expect($results->every(fn ($a) => $a->published_at <= now()))->toBeTrue();
});

it('filters not expired announcements', function () {
    $university = University::factory()->create();

    createAnnouncement(['university_id' => $university->id, 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'expires_at' => null]);
    createAnnouncement(['university_id' => $university->id, 'expires_at' => now()->subDays(5)->format('Y-m-d H:i')]);

    $results = Announcement::notExpired()->get();

    expect($results)->toHaveCount(3);
});

it('filters visible announcements (active, published, not expired)', function () {
    $university = University::factory()->create();

    createAnnouncement(['university_id' => $university->id, 'is_active' => true, 'published_at' => now()->subDays(2)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => true, 'published_at' => now()->subDays(2)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => false, 'published_at' => now()->subDays(2)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => true, 'published_at' => now()->addDays(2)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    createAnnouncement(['university_id' => $university->id, 'is_active' => true, 'published_at' => now()->subDays(2)->format('Y-m-d H:i'), 'expires_at' => now()->subDays(1)->format('Y-m-d H:i')]);

    $results = Announcement::visible()->get();

    expect($results)->toHaveCount(2);
});

it('checks if announcement is published', function () {
    $published = createAnnouncement(['published_at' => now()->subDays(1)->format('Y-m-d H:i')]);
    $unpublished = createAnnouncement(['published_at' => now()->addDays(1)->format('Y-m-d H:i')]);
    $notSet = createAnnouncement(['published_at' => null]);

    expect($published->isPublished())->toBeTrue();
    expect($unpublished->isPublished())->toBeFalse();
    expect($notSet->isPublished())->toBeFalse();
});

it('checks if announcement has expired', function () {
    $notExpired = createAnnouncement(['expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    $expired = createAnnouncement(['expires_at' => now()->subDays(1)->format('Y-m-d H:i')]);
    $noExpire = createAnnouncement(['expires_at' => null]);

    expect($notExpired->hasExpired())->toBeFalse();
    expect($expired->hasExpired())->toBeTrue();
    expect($noExpire->hasExpired())->toBeFalse();
});

it('checks if announcement is visible', function () {
    $visible = createAnnouncement(['is_active' => true, 'published_at' => now()->subDays(1)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    $inactive = createAnnouncement(['is_active' => false, 'published_at' => now()->subDays(1)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    $notPublished = createAnnouncement(['is_active' => true, 'published_at' => now()->addDays(1)->format('Y-m-d H:i'), 'expires_at' => now()->addDays(5)->format('Y-m-d H:i')]);
    $expired = createAnnouncement(['is_active' => true, 'published_at' => now()->subDays(1)->format('Y-m-d H:i'), 'expires_at' => now()->subDays(1)->format('Y-m-d H:i')]);

    expect($visible->isVisible())->toBeTrue();
    expect($inactive->isVisible())->toBeFalse();
    expect($notPublished->isVisible())->toBeFalse();
    expect($expired->isVisible())->toBeFalse();
});

it('has relationship to university', function () {
    $university = University::factory()->create();
    $announcement = createAnnouncement(['university_id' => $university->id]);

    expect($announcement->university)->toBeInstanceOf(University::class);
    expect($announcement->university->id)->toBe($university->id);
});

it('has relationship to user', function () {
    $user = User::factory()->create();
    $announcement = createAnnouncement(['user_id' => $user->id]);

    expect($announcement->user)->toBeInstanceOf(User::class);
    expect($announcement->user->id)->toBe($user->id);
});

it('soft deletes correctly', function () {
    $announcement = createAnnouncement();
    $id = $announcement->id;

    $announcement->delete();

    $this->assertDatabaseMissing('announcements', ['id' => $id, 'deleted_at' => null]);
    expect(Announcement::withTrashed()->find($id))->not->toBeNull();
});

it('allows custom slug to be set', function () {
    $announcement = createAnnouncement([
        'slug' => 'custom-slug',
        'title' => 'Different Title',
    ]);

    expect($announcement->slug)->toBe('custom-slug');
});

it('requires title and content fields', function () {
    $this->expectException(Illuminate\Database\QueryException::class);

    Announcement::create([
        'university_id' => University::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'title' => 'Missing content',
    ]);
});

it('updates announcement successfully', function () {
    $announcement = createAnnouncement(['title' => 'Original Title', 'is_active' => true]);

    $announcement->update([
        'title' => 'Updated Title',
        'is_active' => false,
    ]);

    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'title' => 'Updated Title',
        'is_active' => false,
    ]);
});
