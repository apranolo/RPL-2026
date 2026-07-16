<?php

namespace Tests\Feature;

use App\Models\Contract;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;
    private User $adminKeuangan;
    private User $adminKampusSame;
    private User $adminKampusOther;
    private User $dosen;
    private University $university1;
    private University $university2;
    private Contract $contract;
    private $proposal;

    protected function setUp(): void
    {
        parent::setUp();

        // Roles
        $superAdminRole = Role::updateOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $adminKeuanganRole = Role::updateOrCreate(['name' => Role::ADMIN_KEUANGAN], ['display_name' => 'Admin Keuangan']);
        $adminKampusRole = Role::updateOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        $dosenRole = Role::updateOrCreate(['name' => 'Dosen'], ['display_name' => 'Dosen']);

        // Universities
        $this->university1 = University::factory()->create(['is_active' => true]);
        $this->university2 = University::factory()->create(['is_active' => true]);

        // Users
        $this->superAdmin = User::factory()->create([
            'role_id' => $superAdminRole->id,
            'is_active' => true,
        ]);

        $this->adminKeuangan = User::factory()->create([
            'role_id' => $adminKeuanganRole->id,
            'is_active' => true,
        ]);

        $this->adminKampusSame = User::factory()->create([
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);

        $this->adminKampusOther = User::factory()->create([
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->university2->id,
            'is_active' => true,
        ]);

        $this->dosen = User::factory()->create([
            'role_id' => $dosenRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);

        // Research schema
        $schema = \App\Models\ResearchSchema::create([
            'name' => 'Skema Penelitian Uji Coba',
            'description' => 'Deskripsi',
        ]);

        // Proposal
        $this->proposal = \App\Models\Proposal::factory()->create([
            'user_id' => $this->dosen->id,
            'research_schema_id' => $schema->id,
        ]);

        // Contract
        $this->contract = Contract::create([
            'university_id' => $this->university1->id,
            'proposal_id' => $this->proposal->id,
            'contract_number' => 'KON-2026-0001',
            'title' => 'Kontrak Awal',
            'contract_value' => 50000000.00,
            'status' => 'draft',
            'party_1' => 'LPPM',
            'party_2' => 'Dosen Test',
        ]);
    }

    public function test_super_admin_can_generate_contract()
    {
        $newProposal = \App\Models\Proposal::factory()->create([
            'user_id' => $this->dosen->id,
            'research_schema_id' => $this->proposal->research_schema_id,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.contracts.generate'), [
                'proposal_id' => $newProposal->id,
                'title' => 'Proposal Baru Kontrak',
                'contract_value' => 75000000.00,
                'party_1' => 'LPPM',
                'party_2' => 'Peneliti Utama',
                'start_date' => '2026-08-01',
                'end_date' => '2027-08-01',
                'description' => 'Deskripsi detail kontrak',
                'notes' => 'Catatan penting',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contracts', [
            'proposal_id' => $newProposal->id,
            'title' => 'Proposal Baru Kontrak',
            'contract_value' => '75000000.00',
            'status' => 'draft',
        ]);
    }

    public function test_admin_kampus_cannot_generate_contract()
    {
        $newProposal = \App\Models\Proposal::factory()->create([
            'user_id' => $this->dosen->id,
            'research_schema_id' => $this->proposal->research_schema_id,
        ]);

        $response = $this->actingAs($this->adminKampusSame)
            ->post(route('admin.contracts.generate'), [
                'proposal_id' => $newProposal->id,
                'title' => 'Proposal Baru Kontrak',
                'contract_value' => 75000000.00,
                'party_1' => 'LPPM',
                'party_2' => 'Peneliti Utama',
            ]);

        $response->assertStatus(403);
    }

    public function test_super_admin_and_finance_can_view_any_contract()
    {
        $response1 = $this->actingAs($this->superAdmin)
            ->get(route('admin.contracts.show', $this->contract->id));
        $response1->assertStatus(200);

        $response2 = $this->actingAs($this->adminKeuangan)
            ->get(route('admin.contracts.show', $this->contract->id));
        $response2->assertStatus(200);
    }

    public function test_admin_kampus_can_only_view_their_university_contracts()
    {
        // Same university (authorized)
        $response1 = $this->actingAs($this->adminKampusSame)
            ->get(route('admin.contracts.show', $this->contract->id));
        $response1->assertStatus(200);

        // Different university (unauthorized)
        $response2 = $this->actingAs($this->adminKampusOther)
            ->get(route('admin.contracts.show', $this->contract->id));
        $response2->assertStatus(403);
    }

    public function test_unauthorized_roles_cannot_view_contracts()
    {
        $response = $this->actingAs($this->dosen)
            ->get(route('admin.contracts.show', $this->contract->id));
        $response->assertStatus(403);
    }

    public function test_authorized_users_can_update_contract_status()
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.contracts.update-status', $this->contract->id), [
                'status' => 'active',
                'notes' => 'Kontrak diaktifkan',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contracts', [
            'id' => $this->contract->id,
            'status' => 'active',
            'notes' => 'Kontrak diaktifkan',
        ]);
    }

    public function test_admin_kampus_cannot_update_status_of_other_universities()
    {
        $response = $this->actingAs($this->adminKampusOther)
            ->post(route('admin.contracts.update-status', $this->contract->id), [
                'status' => 'active',
            ]);

        $response->assertStatus(403);
    }
}
