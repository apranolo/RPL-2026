<?php

use App\Models\Proposal;
use App\Models\ProposalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('authorized user can upload a valid proposal document', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $proposal = Proposal::factory()->create(['user_id' => $user->id]);

    $file = UploadedFile::fake()->create('proposal.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)
        ->postJson(route('document.upload', $proposal), [
            'file' => $file,
            'document_type' => 'Proposal',
            'description' => 'Proposal utama naskah penelitian',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('message', 'Dokumen berhasil diunggah.');

    $uploadedDocument = ProposalDocument::first();
    expect($uploadedDocument)->not->toBeNull()
        ->and($uploadedDocument->proposal_id)->toBe($proposal->id)
        ->and($uploadedDocument->file_name)->toBe('proposal.pdf')
        ->and($uploadedDocument->document_type)->toBe('Proposal');

    Storage::disk('public')->assertExists($uploadedDocument->file_path);
});

test('unauthorized user cannot upload proposal document', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $proposal = Proposal::factory()->create(['user_id' => $owner->id]);

    $otherUser = User::factory()->create();
    $file = UploadedFile::fake()->create('proposal.pdf', 500, 'application/pdf');

    $response = $this->actingAs($otherUser)
        ->postJson(route('document.upload', $proposal), [
            'file' => $file,
            'document_type' => 'Proposal',
        ]);

    $response->assertStatus(403);
    expect(ProposalDocument::count())->toBe(0);
});

test('document upload fails with invalid file types or oversized files', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $proposal = Proposal::factory()->create(['user_id' => $user->id]);

    // Test oversize file (12MB)
    $largeFile = UploadedFile::fake()->create('large.pdf', 12000, 'application/pdf');
    $response = $this->actingAs($user)
        ->postJson(route('document.upload', $proposal), [
            'file' => $largeFile,
            'document_type' => 'Proposal',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['file']);

    // Test invalid extension (exe)
    $exeFile = UploadedFile::fake()->create('virus.exe', 100, 'application/x-msdownload');
    $response = $this->actingAs($user)
        ->postJson(route('document.upload', $proposal), [
            'file' => $exeFile,
            'document_type' => 'Proposal',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['file']);

    expect(ProposalDocument::count())->toBe(0);
});
