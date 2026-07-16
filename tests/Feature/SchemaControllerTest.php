<?php

use App\Models\ResearchSchema;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seedRoles();
    $this->admin = User::factory()->superAdmin()->create();
});

it('can view schema index page as super admin', function () {
    ResearchSchema::factory()->count(2)->create();

    $this->actingAs($this->admin)
        ->get(route('admin.schema.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Schema/Index')
            ->has('schemas')
        );
});

it('can view schema detail page as super admin', function () {
    $schema = ResearchSchema::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('admin.schema.show', $schema->id))
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
        ->get(route('admin.schema.index'))
        ->assertForbidden();
});

it('prevents non-super admin from viewing schema detail', function () {
    $user = User::factory()->user()->create();
    $schema = ResearchSchema::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.schema.show', $schema->id))
        ->assertForbidden();
});
