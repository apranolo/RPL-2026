<?php

use App\Models\Issue;
use App\Models\Journal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();

    // Pastikan role PENGELOLA_JURNAL ada
    $role = Role::firstOrCreate(
        ['name' => Role::PENGELOLA_JURNAL],
        ['display_name' => 'Pengelola Jurnal']
    );

    $this->user = User::factory()->create();
    $this->user->roles()->attach($role->id);

    $this->journal = Journal::factory()->create([
        'user_id' => $this->user->id,
    ]);
});

test('production issue create page is rendered', function () {
    $response = $this->actingAs($this->user)
        ->get(route('production.issue.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Production/Issue/Create')
    );
});

test('can submit new issue to store', function () {
    $payload = [
        'volume' => 1,
        'number' => 2,
        'year' => 2026,
        'title' => 'Inovasi Teknologi Terkini',
        'description' => 'Kumpulan jurnal tentang inovasi terbaru di bidang rekayasa perangkat lunak.',
    ];

    $response = $this->actingAs($this->user)
        ->post(route('production.issue.store'), $payload);

    $response->assertRedirect(route('production.issue.create'));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('issues', [
        'journal_id' => $this->journal->id,
        'volume' => 1,
        'number' => 2,
        'year' => 2026,
        'title' => 'Inovasi Teknologi Terkini',
    ]);
});

test('production issue edit page is rendered', function () {
    $issue = Issue::create([
        'journal_id' => $this->journal->id,
        'volume' => 1,
        'number' => 1,
        'year' => 2026,
        'title' => 'Tema Lama',
        'description' => 'Deskripsi lama',
        'status' => 'Draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('production.issue.edit', $issue));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Production/Issue/Edit')
        ->has('issue', fn (Assert $page) => $page
            ->where('id', $issue->id)
            ->where('volume', $issue->volume)
            ->where('number', $issue->number)
            ->where('year', $issue->year)
            ->where('title', $issue->title)
            ->where('description', $issue->description)
            ->where('status', $issue->status)
        )
    );
});

test('can update existing issue metadata', function () {
    $issue = Issue::create([
        'journal_id' => $this->journal->id,
        'volume' => 1,
        'number' => 1,
        'year' => 2026,
        'title' => 'Tema Lama',
        'description' => 'Deskripsi lama',
        'status' => 'Draft',
    ]);

    $payload = [
        'volume' => 2,
        'number' => 3,
        'year' => 2027,
        'title' => 'Tema Baru',
        'description' => 'Deskripsi baru yang diupdate',
    ];

    $response = $this->actingAs($this->user)
        ->put(route('production.issue.update', $issue), $payload);

    $response->assertRedirect(route('production.issue.edit', $issue));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('issues', [
        'id' => $issue->id,
        'journal_id' => $this->journal->id,
        'volume' => 2,
        'number' => 3,
        'year' => 2027,
        'title' => 'Tema Baru',
        'description' => 'Deskripsi baru yang diupdate',
    ]);
});

test('cannot edit issue belonging to another user', function () {
    // Create another user and journal
    $otherUser = User::factory()->create();
    $otherJournal = Journal::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $issue = Issue::create([
        'journal_id' => $otherJournal->id,
        'volume' => 1,
        'number' => 1,
        'year' => 2026,
        'status' => 'Draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('production.issue.edit', $issue));

    $response->assertStatus(403);

    $payload = [
        'volume' => 2,
        'number' => 3,
        'year' => 2027,
    ];

    $responsePut = $this->actingAs($this->user)
        ->put(route('production.issue.update', $issue), $payload);

    $responsePut->assertStatus(403);
});
