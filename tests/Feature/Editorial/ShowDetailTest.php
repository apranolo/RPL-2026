<?php

use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('halaman detail submission dapat diakses oleh editor', function () {
    // 1. Ambil atau buat Role 'Editor'
    $editorRole = Role::firstOrCreate(['name' => 'Editor'], ['display_name' => 'Editor']);

    // 2. Buat User menggunakan role_id tersebut
    $user = User::factory()->create(['role_id' => $editorRole->id]);

    // 4. Buat data naskah
    $submission = Submission::factory()->create();

    // 5. Jalankan pengujian (pastikan menggunakan id_submission)
    $this->actingAs($user)
        ->get('/editorial/desk/'.$submission->id)
        ->assertStatus(200);
});
