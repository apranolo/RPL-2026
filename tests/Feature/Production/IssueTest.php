<?php

use App\Models\User;
use App\Models\Role;
use App\Models\Journal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
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
