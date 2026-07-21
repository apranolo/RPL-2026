<?php

use App\Models\Contract;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get('/admin/dashboard')->assertRedirect(route('login'));
});

test('unauthorized roles are forbidden', function () {
    $userRole = Role::create(['name' => Role::USER, 'display_name' => 'User']);
    $user = User::factory()->create([
        'role_id' => $userRole->id,
        'is_active' => true,
    ]);

    $this->actingAs($user)->get('/admin/dashboard')->assertForbidden();
});

test('authorized users can visit dashboard and see inertia properties', function () {
    $superAdminRole = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super Administrator']);

    $superAdmin = User::factory()->create([
        'role_id' => $superAdminRole->id,
        'university_id' => null,
        'is_active' => true,
    ]);

    $response = $this->actingAs($superAdmin)->get('/admin/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard/Admin')
        ->has('stats')
        ->has('yearlyFundingData')
        ->has('facultyPerformance')
        ->has('topResearch')
        ->has('topLecturers')
        ->has('systemLogs')
    );
});

test('admin kampus is scoped to their university data', function () {
    $adminKampusRole = Role::create(['name' => Role::ADMIN_KAMPUS, 'display_name' => 'Administrator Kampus']);
    $dosenRole = Role::create(['name' => 'Dosen', 'display_name' => 'Dosen']);

    $uniA = University::create(['name' => 'Univ A', 'code' => 'UA']);
    $uniB = University::create(['name' => 'Univ B', 'code' => 'UB']);

    $adminA = User::factory()->create([
        'role_id' => $adminKampusRole->id,
        'university_id' => $uniA->id,
        'is_active' => true,
    ]);

    $dosenA = User::factory()->create([
        'role_id' => $dosenRole->id,
        'university_id' => $uniA->id,
    ]);
    $dosenB = User::factory()->create([
        'role_id' => $dosenRole->id,
        'university_id' => $uniB->id,
    ]);

    $schema = ResearchSchema::create(['name' => 'Skema A']);

    // Proposal A (Univ A)
    $proposalA = Proposal::create([
        'title' => 'Proposal Univ A',
        'description' => 'Desc A',
        'user_id' => $dosenA->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Diterima',
    ]);

    // Proposal B (Univ B)
    $proposalB = Proposal::create([
        'title' => 'Proposal Univ B',
        'description' => 'Desc B',
        'user_id' => $dosenB->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Diterima',
    ]);

    // Contract A (Univ A)
    Contract::create([
        'university_id' => $uniA->id,
        'proposal_id' => $proposalA->id,
        'contract_number' => 'CON-A',
        'title' => 'Contract A',
        'status' => 'active',
        'contract_value' => 5000000,
        'party_1' => 'Pihak 1',
        'party_2' => 'Pihak 2',
    ]);

    // Contract B (Univ B)
    Contract::create([
        'university_id' => $uniB->id,
        'proposal_id' => $proposalB->id,
        'contract_number' => 'CON-B',
        'title' => 'Contract B',
        'status' => 'active',
        'contract_value' => 7000000,
        'party_1' => 'Pihak 1',
        'party_2' => 'Pihak 2',
    ]);

    $response = $this->actingAs($adminA)->get('/admin/dashboard');
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard/Admin')
        ->where('stats.total_proposals', 1)
        ->where('stats.approved_proposals', 1)
        ->where('stats.total_absorbed_funding', 5000000.0)
    );
});
