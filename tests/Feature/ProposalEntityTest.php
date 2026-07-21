<?php

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('research schema can be created with max funding and active status', function () {
    $schema = ResearchSchema::create([
        'name' => 'Skema Penelitian Unggulan',
        'description' => 'Deskripsi skema unggulan LPPM.',
        'max_funding' => 150000000.00,
        'is_active' => true,
    ]);

    expect($schema->name)->toBe('Skema Penelitian Unggulan')
        ->and($schema->max_funding)->toBe(150000000.00)
        ->and($schema->is_active)->toBe(true);
});

test('proposal can be created and maps virtual accessors for frontend', function () {
    $user = User::factory()->create();
    $schema = ResearchSchema::create([
        'name' => 'Skema Dasar',
        'max_funding' => 50000000.00,
    ]);

    $proposal = Proposal::create([
        'user_id' => $user->id,
        'research_schema_id' => $schema->id,
        'title' => 'Implementasi Machine Learning Pada IoT',
        'abstract' => 'Abstrak penelitian...',
        'background' => 'Latar belakang...',
        'proposal_doc_path' => 'proposals/doc.pdf',
        'status' => 'Submitted',
        'submitted_at' => now(),
    ]);

    expect($proposal->title)->toBe('Implementasi Machine Learning Pada IoT')
        ->and($proposal->status)->toBe('Submitted')
        ->and($proposal->status_proposal)->toBe('Submitted')
        ->and($proposal->proposal_doc_path)->toBe('proposals/doc.pdf')
        ->and($proposal->file_dokumen_proposal)->toBe('proposals/doc.pdf')
        ->and($proposal->toArray())->toHaveKeys(['status', 'proposal_doc_path']);
});
