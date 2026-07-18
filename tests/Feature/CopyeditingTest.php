<?php

uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class);

use App\Models\CopyeditingTask;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('unauthenticated user cannot access copyediting routes', function () {
    $this->get('/user/pembinaan/copyediting/1/panel')->assertRedirect('/login');
    $this->get('/user/pembinaan/copyediting/1/approval')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/upload')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/approve')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/reject')->assertRedirect('/login');
});

test('non copyeditor cannot access copyediting panel', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get("/user/pembinaan/copyediting/{$task->id}/panel")
        ->assertStatus(403);
});

test('non author cannot access approval page', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get("/user/pembinaan/copyediting/{$task->id}/approval")
        ->assertStatus(403);
});

test('non copyeditor cannot upload copyedited file', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id}/upload", [
            'copyedited_file' => $file,
        ])
        ->assertStatus(403);
});

test('non author cannot approve copyediting task', function () {
    $task = CopyeditingTask::factory()->create(['status' => 'Completed']);
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id}/approve")
        ->assertStatus(403);
});

test('non author cannot reject copyediting task', function () {
    $task = CopyeditingTask::factory()->create(['status' => 'Completed']);
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id}/reject", [
            'author_approval_notes' => 'Perlu diperbaiki',
        ])
        ->assertStatus(403);
});
