<?php

use App\Models\Schema;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seedRoles();
    $this->admin = User::factory()->superAdmin()->create();
});

it('can view schema index page as super admin', function () {
    Schema::create(['name' => 'Schema 1', 'description' => 'Desc 1']);
    Schema::create(['name' => 'Schema 2', 'description' => 'Desc 2']);

    $this->actingAs($this->admin)
        ->get(route('admin.schemas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Schema/Index')
            ->has('schemas')
        );
});

it('can view schema detail page as super admin', function () {
    $schema = Schema::create(['name' => 'Schema Detail', 'description' => 'Desc Detail']);

    $this->actingAs($this->admin)
        ->get(route('admin.schemas.show', $schema->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Schema/Show')
            ->has('schema')
            ->where('schema.id', $schema->id)
        );
});

it('prevents non-super admin from viewing schema index', function () {
    $user = User::factory()->user()->create();

    $this->actingAs($user)
        ->get(route('admin.schemas.index'))
        ->assertForbidden();
});

it('prevents non-super admin from viewing schema detail', function () {
    $user = User::factory()->user()->create();
    $schema = Schema::create(['name' => 'Schema Detail', 'description' => 'Desc Detail']);

    $this->actingAs($user)
        ->get(route('admin.schemas.show', $schema->id))
        ->assertForbidden();
});
