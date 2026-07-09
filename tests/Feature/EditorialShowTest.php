<?php

use App\Models\User;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('editor dapat melihat halaman detail submission', function () {
    
    $editor = User::factory()->create();
    $submission = Submission::factory()->create();
    $response = $this->actingAs($editor)->get("/editorial/desk/{$submission->id_submission}");

    $response->assertStatus(200);
    
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Editorial/Desk/Show')
        ->has('submission')
    );
});