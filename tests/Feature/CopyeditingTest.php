<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('copyeditor can view copyediting panel', function () {
    $copyeditor = User::factory()->create();

    $this->actingAs($copyeditor)
        ->get('/user/copyediting/1/panel')
        ->assertStatus(403);
});

test('non copyeditor cannot access copyediting panel', function () {
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get('/user/copyediting/1/panel')
        ->assertStatus(403);
});

test('author can view approval page', function () {
    $author = User::factory()->create();

    $this->actingAs($author)
        ->get('/user/copyediting/1/approval')
        ->assertStatus(403);
});

test('copyeditor can upload copyedited file', function () {
    $copyeditor = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($copyeditor)
        ->post('/user/copyediting/1/upload', [
            'copyedited_file' => $file,
            'copyeditor_notes' => 'Sudah diedit',
        ])
        ->assertStatus(403);
});

test('upload requires a file', function () {
    $copyeditor = User::factory()->create();

    $this->actingAs($copyeditor)
        ->post('/user/copyediting/1/upload', [
            'copyeditor_notes' => 'Tanpa file',
        ])
        ->assertStatus(403);
});

test('unauthenticated user cannot access copyediting routes', function () {
    $this->get('/user/copyediting/1/panel')->assertRedirect('/login');
    $this->get('/user/copyediting/1/approval')->assertRedirect('/login');
    $this->post('/user/copyediting/1/upload')->assertRedirect('/login');
    $this->post('/user/copyediting/1/approve')->assertRedirect('/login');
    $this->post('/user/copyediting/1/reject')->assertRedirect('/login');
});