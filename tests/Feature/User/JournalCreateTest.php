<?php

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

test('user_dapat_membuat_journal_baru_dengan_data_valid', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Ilmu Komputer Indonesia',
            'e_issn'             => '1234-5678',
            'issn'               => '8765-4321',
            'url'                => 'https://journal.example.ac.id',
            'oai_pmh_url'        => 'https://journal.example.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertRedirect(route('user.journals.index'));

    $this->assertDatabaseHas('journals', [
        'title'         => 'Jurnal Ilmu Komputer Indonesia',
        'e_issn'        => '1234-5678',
        'user_id'       => $user->id,
        'university_id' => $university->id,
        'sinta_rank'    => 'non_sinta',
    ]);
});

test('user_dapat_membuat_journal_dengan_akreditasi_sinta', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'                    => 'Jurnal Sains Terapan',
            'e_issn'                   => '2222-3333',
            'url'                      => 'https://jurnal.ac.id',
            'oai_pmh_url'              => 'https://jurnal.ac.id/oai',
            'frequency'                => 'Semi-Annual',
            'scientific_field_id'      => $field->id,
            'sinta_rank'               => 'sinta_2',
            'accreditation_start_year' => 2023,
            'accreditation_end_year'   => 2028,
            'accreditation_sk_number'  => '105/E/KPT/2023',
            'accreditation_sk_date'    => '2023-06-15',
        ])
        ->assertRedirect(route('user.journals.index'));

    $journal = Journal::where('e_issn', '2222-3333')->first();
    expect($journal)->not->toBeNull();
    expect($journal->sinta_rank)->toBe('sinta_2');
    expect($journal->accreditation_sk_number)->toBe('105/E/KPT/2023');
});

test('user_dapat_membuat_journal_dengan_indexation_url', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Terindeks Scopus',
            'e_issn'             => '4444-5555',
            'url'                => 'https://journal.scopus.ac.id',
            'oai_pmh_url'        => 'https://journal.scopus.ac.id/oai',
            'frequency'          => 'Monthly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'sinta_1',
            'indexations'        => [
                ['platform' => 'Scopus', 'url' => 'https://www.scopus.com/sourceid/12345'],
                ['platform' => 'DOAJ', 'url' => ''],
            ],
        ])
        ->assertRedirect(route('user.journals.index'));

    $journal = Journal::where('e_issn', '4444-5555')->first();
    expect($journal)->not->toBeNull();

    // Indexations should be stored as keyed JSON
    $indexations = $journal->indexations;
    expect($indexations)->toHaveKey('Scopus');
    expect($indexations)->toHaveKey('DOAJ');
    expect($indexations['Scopus']['url'])->toBe('https://www.scopus.com/sourceid/12345');
});

test('user_dapat_membuat_journal_dengan_indexation_tanpa_url', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Indeks Kosong',
            'e_issn'             => '6666-7777',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
            'indexations'        => [
                ['platform' => 'Google Scholar', 'url' => ''],
            ],
        ])
        ->assertRedirect(route('user.journals.index'));

    $journal = Journal::where('e_issn', '6666-7777')->first();
    expect($journal)->not->toBeNull();
    expect($journal->indexations)->toHaveKey('Google Scholar');
    expect($journal->indexations['Google Scholar']['url'])->toBeNull();
});

// ---------------------------------------------------------------------------
// Validation failures
// ---------------------------------------------------------------------------

test('gagal_simpan_jika_title_kosong', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => '',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['title']);

    $this->assertDatabaseCount('journals', 0);
});

test('gagal_simpan_jika_e_issn_kosong', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['e_issn']);
});

test('gagal_simpan_jika_format_e_issn_tidak_valid', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '12345678',   // missing dash
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['e_issn']);
});

test('gagal_simpan_jika_oai_pmh_url_kosong', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => '',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['oai_pmh_url']);
});

test('gagal_simpan_jika_frequency_kosong', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => '',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['frequency']);
});

test('gagal_simpan_jika_scientific_field_id_tidak_valid', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Monthly',
            'scientific_field_id' => 99999,   // non-existent
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['scientific_field_id']);
});

test('gagal_simpan_jika_sinta_rank_tidak_valid', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Monthly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'invalid_rank',
        ])
        ->assertSessionHasErrors(['sinta_rank']);
});

test('gagal_simpan_jika_url_indexation_format_tidak_valid', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Monthly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
            'indexations'        => [
                ['platform' => 'Scopus', 'url' => 'not-a-valid-url'],
            ],
        ])
        ->assertSessionHasErrors(['indexations.Scopus.url']);
});

// ---------------------------------------------------------------------------
// Authorization failures
// ---------------------------------------------------------------------------

test('gagal_simpan_jika_user_tidak_memiliki_university', function () {
    // User with university_id = null
    $user = User::factory()->user(null)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), [
            'title'              => 'Jurnal Test',
            'e_issn'             => '1234-5678',
            'url'                => 'https://journal.ac.id',
            'oai_pmh_url'        => 'https://journal.ac.id/oai',
            'frequency'          => 'Quarterly',
            'scientific_field_id' => $field->id,
            'sinta_rank'         => 'non_sinta',
        ])
        ->assertSessionHasErrors(['university_id']);

    $this->assertDatabaseCount('journals', 0);
});

test('tamu_tidak_dapat_mengakses_form_buat_journal', function () {
    $this->get(route('user.journals.create'))
        ->assertRedirect(route('login'));
});

test('tamu_tidak_dapat_menyimpan_journal', function () {
    $this->post(route('user.journals.store'), [])
        ->assertRedirect(route('login'));
});

test('user_tidak_aktif_diarahkan_ke_login', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => false]);

    // The CheckRole middleware logs out inactive users and redirects to login
    $this->actingAs($user)
        ->get(route('user.journals.create'))
        ->assertRedirect(route('login'));
});
