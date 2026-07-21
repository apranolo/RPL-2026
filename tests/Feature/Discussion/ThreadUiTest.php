<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('discussion.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can access discussion thread page', function () {
    $userRole = Role::firstOrCreate(
        ['name' => Role::USER],
        ['display_name' => 'User']
    );

    $user = User::factory()->create([
        'role_id' => $userRole->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('discussion.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Discussion/Thread')
        ->has('discussions')
    );
});
