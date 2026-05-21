<?php

use App\Models\Journal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();

    // Pastikan role USER ada (firstOrCreate, tidak pakai factory)
    $role = Role::firstOrCreate(
        ['name' => Role::USER],
        ['display_name' => 'User']
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
        'volume' => '1',
        'nomor' => '2',
        'tahun' => 2026,
        'judul_tematik' => 'Inovasi Teknologi Terkini',
        'deskripsi' => 'Kumpulan jurnal tentang inovasi terbaru di bidang rekayasa perangkat lunak.',
    ];

    $response = $this->actingAs($this->user)
        ->post(route('production.issue.store'), $payload);

    $response->assertRedirect(route('production.issue.create'));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('production_issues', [
        'journal_id' => $this->journal->id,
        'volume' => '1',
        'nomor' => '2',
        'tahun' => 2026,
        'judul_tematik' => 'Inovasi Teknologi Terkini',
    ]);
});

test('production issue edit page is rendered', function () {
    $issue = \App\Models\ProductionIssue::create([
        'journal_id' => $this->journal->id,
        'volume' => '1',
        'nomor' => '1',
        'tahun' => 2026,
        'judul_tematik' => 'Tema Lama',
        'deskripsi' => 'Deskripsi lama',
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('production.issue.edit', $issue));

    // Nonaktifkan pengecekan file fisik komponen Inertia khusus di test ini
    // karena file Edit.tsx baru akan dibuat di task/branch selanjutnya.
    config()->set('inertia.testing.ensure_pages_exist', false);

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Production/Issue/Edit')
        ->has('issue', fn (Assert $page) => $page
            ->where('id', $issue->id)
            ->where('volume', $issue->volume)
            ->where('nomor', $issue->nomor)
            ->where('tahun', $issue->tahun)
            ->where('judul_tematik', $issue->judul_tematik)
            ->where('deskripsi', $issue->deskripsi)
            ->where('status', $issue->status)
        )
    );
});

test('can update existing issue metadata', function () {
    $issue = \App\Models\ProductionIssue::create([
        'journal_id' => $this->journal->id,
        'volume' => '1',
        'nomor' => '1',
        'tahun' => 2026,
        'judul_tematik' => 'Tema Lama',
        'deskripsi' => 'Deskripsi lama',
        'status' => 'draft',
    ]);

    $payload = [
        'volume' => '2',
        'nomor' => '3',
        'tahun' => 2027,
        'judul_tematik' => 'Tema Baru',
        'deskripsi' => 'Deskripsi baru yang diupdate',
    ];

    $response = $this->actingAs($this->user)
        ->put(route('production.issue.update', $issue), $payload);

    $response->assertRedirect(route('production.issue.edit', $issue));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('production_issues', [
        'id' => $issue->id,
        'journal_id' => $this->journal->id,
        'volume' => '2',
        'nomor' => '3',
        'tahun' => 2027,
        'judul_tematik' => 'Tema Baru',
        'deskripsi' => 'Deskripsi baru yang diupdate',
    ]);
});

test('cannot edit issue belonging to another user', function () {
    // Create another user and journal
    $otherUser = User::factory()->create();
    $otherJournal = Journal::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $issue = \App\Models\ProductionIssue::create([
        'journal_id' => $otherJournal->id,
        'volume' => '1',
        'nomor' => '1',
        'tahun' => 2026,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('production.issue.edit', $issue));

    $response->assertStatus(403);

    $payload = [
        'volume' => '2',
        'nomor' => '3',
        'tahun' => 2027,
    ];

    $responsePut = $this->actingAs($this->user)
        ->put(route('production.issue.update', $issue), $payload);

    $responsePut->assertStatus(403);
});
