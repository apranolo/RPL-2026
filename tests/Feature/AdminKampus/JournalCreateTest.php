<?php

use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
});

// ---------------------------------------------------------------------------
// Helper: payload jurnal yang valid (minimum required fields)
// ---------------------------------------------------------------------------

function validJournalPayload(int $fieldId): array
{
    return [
        'title' => 'Jurnal Teknologi Informasi',
        'e_issn' => '1111-2222',
        'url' => 'https://journal.example.ac.id',
        'oai_urls' => ['https://journal.example.ac.id/oai'],
        'frequency' => 'Quarterly',
        'scientific_field_id' => $fieldId,
        'sinta_rank' => 'non_sinta',
    ];
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

test('admin_kampus_dapat_membuat_jurnal_tanpa_menentukan_user_id', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), validJournalPayload($field->id))
        ->assertRedirect(route('admin-kampus.journals.index'));

    // Jurnal di-assign ke admin kampus itu sendiri karena tidak ada user_id di form
    // Jurnal langsung berstatus approved karena dibuat oleh Admin Kampus (Bug #4 fix)
    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal Teknologi Informasi',
        'user_id' => $adminKampus->id,
        'university_id' => $university->id,
        'e_issn' => '1111-2222',
        'sinta_rank' => 'non_sinta',
        'approval_status' => 'approved',
        'approved_by' => $adminKampus->id,
    ]);
});

test('admin_kampus_dapat_membuat_jurnal_dan_assign_ke_user_di_universitas_yang_sama', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), [
        'title' => 'Jurnal Kimia Terapan',
        'e_issn' => '3333-4444',
        'user_id' => $user->id,
    ]);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertRedirect(route('admin-kampus.journals.index'));

    // Jurnal di-assign ke user yang dipilih, bukan ke admin kampus
    // Jurnal langsung approved karena dibuat oleh Admin Kampus
    $this->assertDatabaseHas('journals', [
        'e_issn' => '3333-4444',
        'user_id' => $user->id,
        'university_id' => $university->id,
        'approval_status' => 'approved',
    ]);
});

test('admin_kampus_dapat_membuat_jurnal_dengan_sinta_rank', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), [
        'e_issn' => '5555-6666',
        'sinta_rank' => 'sinta_2',
        'accreditation_start_year' => 2023,
        'accreditation_end_year' => 2028,
        'accreditation_sk_number' => '108/E/KPT/2023',
    ]);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertRedirect(route('admin-kampus.journals.index'));

    $journal = Journal::where('e_issn', '5555-6666')->first();
    expect($journal)->not->toBeNull();
    expect($journal->sinta_rank)->toBe('sinta_2');
    expect($journal->accreditation_sk_number)->toBe('108/E/KPT/2023');
});

test('halaman_create_jurnal_dapat_diakses_admin_kampus_dengan_daftar_user_universitasnya', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $user1 = User::factory()->user($university->id)->create(['is_active' => true]);
    $user2 = User::factory()->user($university->id)->create(['is_active' => true]);
    ScientificField::factory()->create(['is_active' => true]);

    $response = $this->actingAs($adminKampus)
        ->get(route('admin-kampus.journals.create'))
        ->assertOk();

    // Props Inertia harus berisi universityUsers
    $response->assertInertia(fn ($page) => $page
        ->component('AdminKampus/Journals/Create')
        ->has('universityUsers', 2)
        ->has('scientificFields')
        ->has('sintaRankOptions')
    );
});

// ---------------------------------------------------------------------------
// Validasi field wajib
// ---------------------------------------------------------------------------

test('gagal_simpan_jika_title_kosong', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), ['title' => '']);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertSessionHasErrors(['title']);

    $this->assertDatabaseCount('journals', 0);
});

test('gagal_simpan_jika_e_issn_format_tidak_valid', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), ['e_issn' => '12345678']); // tanpa tanda hubung

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertSessionHasErrors(['e_issn']);
});

test('gagal_simpan_jika_sinta_rank_tidak_valid', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), ['sinta_rank' => 'rank_xyz']);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertSessionHasErrors(['sinta_rank']);
});

// ---------------------------------------------------------------------------
// Keamanan: user_id dari universitas lain
// ---------------------------------------------------------------------------

test('gagal_jika_admin_kampus_mencoba_assign_jurnal_ke_user_dari_universitas_lain', function () {
    $university1 = University::factory()->create();
    $university2 = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university1->id)->create(['is_active' => true]);
    $userLain = User::factory()->user($university2->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), [
        'e_issn' => '9999-8888',
        'user_id' => $userLain->id,  // user dari universitas lain!
    ]);

    // Controller: firstOrFail() akan throw 404 karena user_id tidak match university_id
    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertNotFound();

    $this->assertDatabaseCount('journals', 0);
});

// ---------------------------------------------------------------------------
// Role-based access control
// ---------------------------------------------------------------------------

test('tamu_tidak_dapat_mengakses_form_buat_jurnal_admin_kampus', function () {
    $this->get(route('admin-kampus.journals.create'))
        ->assertRedirect(route('login'));
});

test('tamu_tidak_dapat_menyimpan_jurnal_admin_kampus', function () {
    $this->post(route('admin-kampus.journals.store'), [])
        ->assertRedirect(route('login'));
});

test('user_role_tidak_dapat_mengakses_form_buat_jurnal_admin_kampus', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);

    $this->actingAs($user)
        ->get(route('admin-kampus.journals.create'))
        ->assertForbidden();
});

test('user_role_tidak_dapat_menyimpan_jurnal_melalui_route_admin_kampus', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->post(route('admin-kampus.journals.store'), validJournalPayload($field->id))
        ->assertForbidden();

    $this->assertDatabaseCount('journals', 0);
});

test('super_admin_tidak_dapat_mengakses_form_buat_jurnal_admin_kampus', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);

    $this->actingAs($superAdmin)
        ->get(route('admin-kampus.journals.create'))
        ->assertForbidden();
});

test('super_admin_tidak_dapat_menyimpan_jurnal_melalui_route_admin_kampus', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $this->actingAs($superAdmin)
        ->post(route('admin-kampus.journals.store'), validJournalPayload($field->id))
        ->assertForbidden();

    $this->assertDatabaseCount('journals', 0);
});

test('admin_kampus_tidak_aktif_diarahkan_ke_login', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => false]);

    // CheckRole middleware logout dan redirect ke login untuk user tidak aktif
    $this->actingAs($adminKampus)
        ->get(route('admin-kampus.journals.create'))
        ->assertRedirect(route('login'));
});

test('admin_kampus_dari_universitas_berbeda_tidak_bisa_assign_ke_user_universitasnya_sendiri', function () {
    // Admin Kampus A tidak bisa assign jurnal ke user universitas B
    $universityA = University::factory()->create();
    $universityB = University::factory()->create();
    $adminA = User::factory()->adminKampus($universityA->id)->create(['is_active' => true]);
    $userB = User::factory()->user($universityB->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);

    $payload = array_merge(validJournalPayload($field->id), ['user_id' => $userB->id]);

    $this->actingAs($adminA)
        ->post(route('admin-kampus.journals.store'), $payload)
        ->assertNotFound();

    $this->assertDatabaseCount('journals', 0);
});
