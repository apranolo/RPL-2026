<?php

use App\Models\Galley;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('issue and galley models can be created and accessors work correctly', function () {
    // 1. Create dependencies
    $editor = User::factory()->create();
    $journal = Journal::factory()->create(['user_id' => $editor->id]);
    $author = User::factory()->create();

    // 2. Create stub Submission
    $submission = Submission::create([
        'journal_id' => $journal->id,
        'author_id' => $author->id,
        'title' => 'Scientific Manuscript Title',
        'status' => 'unassigned',
    ]);

    // 3. Create Issue
    $issue = Issue::create([
        'journal_id' => $journal->id,
        'volume' => 12,
        'number' => 2,
        'year' => 2026,
        'title' => 'Special Edition on AI',
        'description' => 'A thematic issue focusing on modern agentic architectures.',
        'publication_date' => '2026-07-16',
        'status' => 'Published',
        'cover_image_path' => 'covers/issue-12-2.png',
    ]);

    // Verify Issue accessors
    expect($issue->nomor)->toBe(2)
        ->and($issue->tahun)->toBe(2026)
        ->and($issue->judul_tematik)->toBe('Special Edition on AI')
        ->and($issue->deskripsi)->toBe('A thematic issue focusing on modern agentic architectures.')
        ->and($issue->published_at)->toBe('2026-07-16')
        ->and($issue->cover_image_url)->toContain('issue-12-2.png');

    // 4. Create Galley
    $galley = Galley::create([
        'submission_id' => $submission->id,
        'issue_id' => $issue->id,
        'label' => 'PDF',
        'file_path' => 'galleys/file.pdf',
        'page_from' => 15,
        'page_to' => 28,
        'doi' => '10.1234/jurnalmu.v12i2.5678',
        'sequence' => 1,
    ]);

    // Verify Galley accessors
    expect($galley->id_submission)->toBe($submission->id)
        ->and($galley->id_issue)->toBe($issue->id)
        ->and($galley->pages)->toBe('15-28')
        ->and($galley->file_extension)->toBe('pdf')
        ->and($galley->file_url)->toContain('file.pdf');

    // 5. Test relations
    expect($issue->galleys()->count())->toBe(1)
        ->and($issue->galleys->first()->id)->toBe($galley->id)
        ->and($galley->issue->id)->toBe($issue->id)
        ->and($galley->submission->id)->toBe($submission->id);
});
