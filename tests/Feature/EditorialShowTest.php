<?php

use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('editor dapat melihat halaman detail submission', function () {

    $editorRole = Role::firstOrCreate(['name' => 'Editor', 'display_name' => 'Editor']);

    $editor = User::factory()->create(['role_id' => $editorRole->id]);

    $editor->roles()->syncWithoutDetaching([$editorRole->id]);

    $submission = Submission::factory()->create();

    $response = $this->actingAs($editor)->get("/editorial/desk/{$submission->id}");

    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Editorial/Desk/Show')
        ->has('submission')
    );
});
