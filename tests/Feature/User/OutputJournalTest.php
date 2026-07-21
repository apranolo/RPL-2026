<?php

use App\Models\Journal;
use App\Models\JournalOutput;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\University;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
});

test('user dapat membuka form tambah luaran', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $schema = ResearchSchema::create([
        'name' => 'Penelitian Dasar',
        'description' => 'Skema pengujian',
    ]);
    $proposal = Proposal::factory()->create([
        'user_id' => $user->id,
        'research_schema_id' => $schema->id,
        'title' => 'Proposal Uji Luaran',
    ]);
    $journal = Journal::factory()->create([
        'user_id' => $user->id,
        'university_id' => $university->id,
        'title' => 'Jurnal Uji',
    ]);

    $this->actingAs($user)
        ->get(route('user.outputs.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Output/Create')
            ->has('proposals', 1)
            ->where('proposals.0.id', $proposal->id)
            ->has('journals', 1)
            ->where('journals.0.id', $journal->id)
            ->where('outputTypes.jurnal', 'Jurnal')
        );
});

test('user dapat menyimpan luaran publikasi jurnal', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $schema = ResearchSchema::create([
        'name' => 'Penelitian Terapan',
        'description' => 'Skema pengujian',
    ]);
    $proposal = Proposal::factory()->create([
        'user_id' => $user->id,
        'research_schema_id' => $schema->id,
        'title' => 'Proposal Publikasi',
    ]);
    $journal = Journal::factory()->create([
        'user_id' => $user->id,
        'university_id' => $university->id,
        'title' => 'Jurnal Riset',
    ]);

    $this->actingAs($user)
        ->post(route('user.outputs.store-journal'), [
            'proposal_id' => $proposal->id,
            'title' => 'Artikel Sistem Informasi',
            'authors' => 'Siti Aminah, Budi Santoso',
            'year' => 2026,
            'doi' => '10.1234/rpl.2026.001',
            'url' => 'https://journal.example.test/article/1',
            'journal_name' => 'Jurnal Riset',
            'volume' => '5',
            'issue' => '2',
            'pages' => '10-20',
            'issn' => '1234-5678',
            'e_issn' => '8765-4321',
            'publisher' => 'UMY Press',
            'journal_id' => $journal->id,
            'keterangan' => 'Draft luaran publikasi',
        ])
        ->assertRedirect(route('user.outputs.index'));

    $this->assertDatabaseHas('journal_outputs', [
        'title' => 'Artikel Sistem Informasi',
        'doi' => '10.1234/rpl.2026.001',
        'journal_id' => $journal->id,
    ]);

    $journalOutput = JournalOutput::where('doi', '10.1234/rpl.2026.001')->firstOrFail();

    $this->assertDatabaseHas('research_outputs', [
        'proposal_id' => $proposal->id,
        'user_id' => $user->id,
        'kategori' => 'jurnal',
        'judul' => 'Artikel Sistem Informasi',
        'status' => 'draft',
        'outputable_id' => $journalOutput->id,
        'outputable_type' => JournalOutput::class,
    ]);
});
