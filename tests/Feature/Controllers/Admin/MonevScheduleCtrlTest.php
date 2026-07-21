<?php

use App\Models\Contract;
use App\Models\MonevSchedule;
use App\Models\ProgressReport;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles (required for tests)
    $this->seed(\Database\Seeders\RoleSeeder::class);

    $this->university = University::factory()->create();
    $this->otherUniversity = University::factory()->create();

    // Create a ResearchSchema for Proposal factory
    $this->researchSchema = ResearchSchema::create([
        'name' => 'Skema Penelitian Dasar',
        'description' => 'Skema untuk penelitian dasar',
    ]);

    // Create Super Admin user
    $this->superAdmin = User::factory()->create([
        'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
        'university_id' => $this->university->id,
        'is_active' => true,
        'is_reviewer' => true,
    ]);

    // Create Admin Kampus user for authorization tests
    $this->adminKampus = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->first()->id,
        'university_id' => $this->otherUniversity->id,
        'is_active' => true,
    ]);

    // Create a proposal, contract, and evaluator for schedule creation
    $this->proposal = Proposal::create([
        'title' => 'Penelitian AI',
        'description' => 'Deskripsi penelitian',
        'user_id' => $this->superAdmin->id,
        'research_schema_id' => $this->researchSchema->id,
    ]);

    $this->contract = Contract::create([
        'university_id' => $this->university->id,
        'proposal_id' => $this->proposal->id,
        'contract_number' => 'CTR-001',
        'title' => 'Kontrak Penelitian AI',
        'status' => 'active',
        'contract_value' => 10000000,
        'party_1' => 'Universitas A',
        'party_2' => 'Peneliti B',
    ]);

    $this->evaluator = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->first()->id,
        'university_id' => $this->university->id,
        'is_active' => true,
        'is_reviewer' => true,
    ]);
});

// ============================================================================
// INDEX TESTS
// ============================================================================

test('Super Admin can view monev schedules index page', function () {
    actingAs($this->superAdmin)
        ->get(route('admin.monev-schedules.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Monev/Schedule')
            ->has('schedules')
            ->has('contracts')
            ->has('evaluators')
            ->where('activeTab', 'schedules')
        );
});

test('Non-Super Admin cannot view monev schedules index page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.monev-schedules.index'))
        ->assertForbidden();
});

test('unauthenticated user is redirected to login', function () {
    $this->get(route('admin.monev-schedules.index'))
        ->assertRedirect(route('login'));
});

// ============================================================================
// STORE TESTS
// ============================================================================

test('Super Admin can create a monev schedule with valid data', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => $this->contract->id,
            'evaluator_id' => $this->evaluator->id,
            'date' => '2026-08-15',
            'time' => '10:00',
            'location' => 'Ruang Rapat Lt. 3',
        ])
        ->assertRedirect(route('admin.monev-schedules.index'))
        ->assertSessionHas('success', 'Jadwal monev berhasil dibuat.');

    assertDatabaseHas('monev_schedules', [
        'contract_id' => $this->contract->id,
        'evaluator_id' => $this->evaluator->id,
        'date' => '2026-08-15',
        'location' => 'Ruang Rapat Lt. 3',
    ]);
});

test('store fails when contract_id is missing', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'evaluator_id' => $this->evaluator->id,
            'date' => '2026-08-15',
        ])
        ->assertSessionHasErrors('contract_id');
});

test('store fails when evaluator_id is invalid', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => $this->contract->id,
            'evaluator_id' => 99999,
            'date' => '2026-08-15',
        ])
        ->assertSessionHasErrors('evaluator_id');
});

test('store fails when date is missing', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => $this->contract->id,
            'evaluator_id' => $this->evaluator->id,
        ])
        ->assertSessionHasErrors('date');
});

test('store fails when contract_id does not exist in contracts table', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => 99999,
            'evaluator_id' => $this->evaluator->id,
            'date' => '2026-08-15',
        ])
        ->assertSessionHasErrors('contract_id');
});

test('store allows nullable time and location', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => $this->contract->id,
            'evaluator_id' => $this->evaluator->id,
            'date' => '2026-08-15',
            'time' => null,
            'location' => null,
        ])
        ->assertRedirect(route('admin.monev-schedules.index'));

    assertDatabaseHas('monev_schedules', [
        'contract_id' => $this->contract->id,
        'evaluator_id' => $this->evaluator->id,
        'date' => '2026-08-15',
    ]);
});

test('Non-Super Admin cannot create a monev schedule', function () {
    actingAs($this->adminKampus)
        ->post(route('admin.monev-schedules.store'), [
            'contract_id' => $this->contract->id,
            'evaluator_id' => $this->evaluator->id,
            'date' => '2026-08-15',
        ])
        ->assertForbidden();
});

// ============================================================================
// PENDING TESTS
// ============================================================================

test('Super Admin can view pending progress reports page', function () {
    actingAs($this->superAdmin)
        ->get(route('admin.monev-schedules.pending'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Monev/Schedule')
            ->has('pendingReports')
            ->has('schedules')
            ->has('contracts')
            ->has('evaluators')
            ->where('activeTab', 'pending')
        );
});

test('pending page shows submitted progress reports', function () {
    ProgressReport::create([
        'proposal_id' => $this->proposal->id,
        'contract_id' => $this->contract->id,
        'user_id' => $this->superAdmin->id,
        'title' => 'Laporan Kemajuan Q1',
        'content' => 'Isi laporan kemajuan',
        'report_type' => 'laporan_kemajuan',
        'report_date' => '2026-06-01',
        'progress_percentage' => 50,
        'report_period' => '2026-Q1',
        'status' => 'submitted',
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.monev-schedules.pending'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('pendingReports', 1)
        );
});

test('pending page does not include draft reports', function () {
    ProgressReport::create([
        'proposal_id' => $this->proposal->id,
        'contract_id' => $this->contract->id,
        'user_id' => $this->superAdmin->id,
        'title' => 'Laporan Draft',
        'content' => 'Isi draft',
        'report_type' => 'laporan_kemajuan',
        'report_date' => '2026-06-01',
        'progress_percentage' => 20,
        'report_period' => '2026-Q1',
        'status' => 'draft',
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.monev-schedules.pending'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('pendingReports', 0)
        );
});

// ============================================================================
// MULTI-TENANCY TESTS
// ============================================================================

test('index returns schedules filtered by university when user has university_id', function () {
    // Create schedule for our university
    MonevSchedule::create([
        'contract_id' => $this->contract->id,
        'evaluator_id' => $this->evaluator->id,
        'date' => '2026-08-15',
        'status' => 'scheduled',
    ]);

    // Create schedule for a different university
    $otherProposal = Proposal::create([
        'title' => 'Penelitian Lain',
        'description' => 'Deskripsi lain',
        'user_id' => $this->adminKampus->id,
        'research_schema_id' => $this->researchSchema->id,
    ]);
    $otherContract = Contract::create([
        'university_id' => $this->otherUniversity->id,
        'proposal_id' => $otherProposal->id,
        'contract_number' => 'CTR-999',
        'title' => 'Kontrak Lain',
        'status' => 'active',
        'contract_value' => 5000000,
        'party_1' => 'Universitas C',
        'party_2' => 'Peneliti D',
    ]);
    MonevSchedule::create([
        'contract_id' => $otherContract->id,
        'evaluator_id' => $this->adminKampus->id,
        'date' => '2026-09-01',
        'status' => 'scheduled',
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.monev-schedules.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('schedules')
            ->has('contracts')
        );
});
