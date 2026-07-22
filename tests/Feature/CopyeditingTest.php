<?php

use App\Models\CopyeditingTask;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');

    // RefreshDatabase only runs migrations, not seeders, so the "User" role
    // that User::factory()->user() depends on (via roles table lookup) has
    // to be created here for every test run.
    Role::firstOrCreate(
        ['name' => Role::USER],
        ['display_name' => 'User']
    );
});

/*
|--------------------------------------------------------------------------
| Authorization (403) tests
|--------------------------------------------------------------------------
*/

test('unauthenticated user cannot access copyediting routes', function () {
    $this->get('/user/pembinaan/copyediting/1/panel')->assertRedirect('/login');
    $this->get('/user/pembinaan/copyediting/1/approval')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/upload')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/approve')->assertRedirect('/login');
    $this->post('/user/pembinaan/copyediting/1/reject')->assertRedirect('/login');
});

test('non copyeditor cannot access copyediting panel', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->user()->create();

    $this->actingAs($otherUser)
        ->get("/user/pembinaan/copyediting/{$task->id_task}/panel")
        ->assertStatus(403);
});

test('non author cannot access approval page', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->user()->create();

    $this->actingAs($otherUser)
        ->get("/user/pembinaan/copyediting/{$task->id_task}/approval")
        ->assertStatus(403);
});

test('non copyeditor cannot upload copyedited file', function () {
    $task = CopyeditingTask::factory()->create();
    $otherUser = User::factory()->user()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/upload", [
            'copyedited_file' => $file,
        ])
        ->assertStatus(403);
});

test('non author cannot approve copyediting task', function () {
    $task = CopyeditingTask::factory()->create(['status' => 'Completed']);
    $otherUser = User::factory()->user()->create();

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/approve")
        ->assertStatus(403);
});

test('non author cannot reject copyediting task', function () {
    $task = CopyeditingTask::factory()->create(['status' => 'Completed']);
    $otherUser = User::factory()->user()->create();

    $this->actingAs($otherUser)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/reject", [
            'author_approval_notes' => 'Perlu diperbaiki',
        ])
        ->assertStatus(403);
});

/*
|--------------------------------------------------------------------------
| Success-path tests (restored)
|--------------------------------------------------------------------------
| These exercise the real database write paths (upload, approve, reject)
| so that a Column-not-found SQL error on copyediting_tasks would be
| caught immediately by CI instead of being hidden.
*/

test('copyeditor can view panel', function () {
    $copyeditor = User::factory()->user()->create();
    $task = CopyeditingTask::factory()->create([
        'id_copyeditor' => $copyeditor->id,
    ]);

    $this->actingAs($copyeditor)
        ->get("/user/pembinaan/copyediting/{$task->id_task}/panel")
        ->assertOk();
});

test('author can view panel', function () {
    $author = User::factory()->user()->create();
    $submission = Submission::factory()->create(['author_id' => $author->id]);
    $task = CopyeditingTask::factory()->create([
        'id_submission' => $submission->id,
    ]);

    $this->actingAs($author)
        ->get("/user/pembinaan/copyediting/{$task->id_task}/panel")
        ->assertOk();
});

test('copyeditor can upload copyedited file', function () {
    $copyeditor = User::factory()->user()->create();
    $task = CopyeditingTask::factory()->create([
        'id_copyeditor' => $copyeditor->id,
        'status' => 'In_Progress',
    ]);
    $file = UploadedFile::fake()->create('hasil-copyedit.pdf', 100, 'application/pdf');

    $response = $this->actingAs($copyeditor)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/upload", [
            'copyedited_file' => $file,
            'copyeditor_notes' => 'Sudah selesai disunting.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $task->refresh();

    expect($task->status)->toBe('Completed');
    expect($task->copyedited_file_name)->toBe('hasil-copyedit.pdf');
    expect($task->copyedited_file_path)->not->toBeNull();
    expect($task->copyeditor_note)->toBe('Sudah selesai disunting.');

    Storage::disk('public')->assertExists($task->copyedited_file_path);
});

test('author can approve copyedit', function () {
    $author = User::factory()->user()->create();
    $submission = Submission::factory()->create(['author_id' => $author->id]);
    $task = CopyeditingTask::factory()->create([
        'id_submission' => $submission->id,
        'status' => 'Completed',
        'copyedited_file_path' => 'copyediting/copyedited/dummy.pdf',
        'copyedited_file_name' => 'dummy.pdf',
    ]);

    $response = $this->actingAs($author)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/approve", [
            'author_approval_notes' => 'Sudah sesuai, disetujui.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $task->refresh();

    expect($task->status)->toBe('Author_Approved');
    expect($task->author_approval_notes)->toBe('Sudah sesuai, disetujui.');
    expect($task->author_approved_at)->not->toBeNull();
});

test('author can reject copyedit', function () {
    $author = User::factory()->user()->create();
    $submission = Submission::factory()->create(['author_id' => $author->id]);
    $task = CopyeditingTask::factory()->create([
        'id_submission' => $submission->id,
        'status' => 'Completed',
        'copyedited_file_path' => 'copyediting/copyedited/dummy.pdf',
        'copyedited_file_name' => 'dummy.pdf',
    ]);

    $response = $this->actingAs($author)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/reject", [
            'author_approval_notes' => 'Perlu diperbaiki di bagian abstrak.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $task->refresh();

    expect($task->status)->toBe('In_Progress');
    expect($task->author_approval_notes)->toBe('Perlu diperbaiki di bagian abstrak.');
    expect($task->copyedited_file_path)->toBeNull();
    expect($task->copyedited_file_name)->toBeNull();
});

test('author cannot approve copyedit that is not yet completed', function () {
    $author = User::factory()->user()->create();
    $submission = Submission::factory()->create(['author_id' => $author->id]);
    $task = CopyeditingTask::factory()->create([
        'id_submission' => $submission->id,
        'status' => 'In_Progress',
    ]);

    $this->actingAs($author)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/approve")
        ->assertSessionHasErrors('error');

    expect($task->fresh()->status)->toBe('In_Progress');
});

test('reject requires approval notes', function () {
    $author = User::factory()->user()->create();
    $submission = Submission::factory()->create(['author_id' => $author->id]);
    $task = CopyeditingTask::factory()->create([
        'id_submission' => $submission->id,
        'status' => 'Completed',
    ]);

    $this->actingAs($author)
        ->post("/user/pembinaan/copyediting/{$task->id_task}/reject", [])
        ->assertSessionHasErrors('author_approval_notes');
});
