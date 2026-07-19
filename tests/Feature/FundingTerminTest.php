<?php

namespace Tests\Feature;

use App\Models\Contract;
use App\Models\Funding;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Services\FundingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FundingTerminTest extends TestCase
{
    use RefreshDatabase;

    private User $adminKeuangan;

    private Contract $contract;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Admin Keuangan role and user
        $role = Role::updateOrCreate(
            ['name' => 'Admin Keuangan'],
            ['display_name' => 'Admin Keuangan']
        );

        $university = University::factory()->create();

        $this->adminKeuangan = User::factory()->create([
            'role_id' => $role->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        // Create a research schema
        $schema = ResearchSchema::create([
            'name' => 'Skema Penelitian Unggulan',
            'description' => 'Deskripsi skema penelitian unggulan',
        ]);

        // Create a proposal
        $proposal = Proposal::factory()->create([
            'user_id' => $this->adminKeuangan->id,
            'research_schema_id' => $schema->id,
        ]);

        // Create a contract
        $this->contract = Contract::create([
            'university_id' => $university->id,
            'proposal_id' => $proposal->id,
            'contract_number' => 'KTR-TEST-001',
            'title' => 'Penelitian Uji Coba',
            'contract_value' => 100000000.00,
            'status' => Contract::STATUS_ACTIVE,
            'party_1' => 'LPPM',
            'party_2' => 'Dosen',
        ]);
    }

    public function test_funding_service_calculates_sisa_correctly()
    {
        // Create 2 existing termins at 30% and 40%
        Funding::create([
            'contract_id' => $this->contract->id,
            'funding_number' => 'TRM-1-001',
            'amount' => 30000000,
            'percentage' => 30,
            'status' => Funding::STATUS_DISBURSED,
        ]);

        Funding::create([
            'contract_id' => $this->contract->id,
            'funding_number' => 'TRM-1-002',
            'amount' => 40000000,
            'percentage' => 40,
            'status' => Funding::STATUS_PLANNED,
        ]);

        $service = new FundingService;
        $sisa = $service->calculateSisa($this->contract);

        $this->assertEquals(100000000, $sisa['total_pendanaan']);
        $this->assertEquals(70000000, $sisa['total_dialokasikan']);
        $this->assertEquals(30000000, $sisa['total_cair']);
        $this->assertEquals(30000000, $sisa['sisa_dana']);
        $this->assertEquals(30, $sisa['sisa_persentase']);
    }

    public function test_funding_service_validates_percentage_limit()
    {
        Funding::create([
            'contract_id' => $this->contract->id,
            'funding_number' => 'TRM-1-001',
            'amount' => 70000000,
            'percentage' => 70,
            'status' => Funding::STATUS_PLANNED,
        ]);

        $service = new FundingService;

        $this->assertTrue($service->validateTerminPercentage($this->contract, 30));
        $this->assertFalse($service->validateTerminPercentage($this->contract, 31));
    }

    public function test_admin_keuangan_can_access_create_page()
    {
        $response = $this->actingAs($this->adminKeuangan)
            ->get(route('finance.funding.create', $this->contract->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Finance/Funding/Create')
            ->has('contract')
            ->has('termins')
            ->has('sisa')
        );
    }

    public function test_store_termin_succeeds_with_valid_data()
    {
        $response = $this->actingAs($this->adminKeuangan)
            ->post(route('finance.funding.store-termin'), [
                'id_contract' => $this->contract->id,
                'percentage' => 30,
                'description' => 'Pencairan Tahap 1',
                'funding_date' => '2026-08-01',
                'due_date' => '2026-08-15',
                'notes' => 'Termin awal',
            ]);

        $response->assertRedirect(route('finance.funding.create', $this->contract->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('fundings', [
            'contract_id' => $this->contract->id,
            'percentage' => '30.00',
            'status' => 'planned',
        ]);
    }

    public function test_store_termin_rejects_exceeding_percentage()
    {
        // Create existing 80% termin
        Funding::create([
            'contract_id' => $this->contract->id,
            'funding_number' => 'TRM-1-001',
            'amount' => 80000000,
            'percentage' => 80,
            'status' => Funding::STATUS_PLANNED,
        ]);

        $response = $this->actingAs($this->adminKeuangan)
            ->post(route('finance.funding.store-termin'), [
                'id_contract' => $this->contract->id,
                'percentage' => 25,
                'description' => 'Exceeding termin',
            ]);

        $response->assertSessionHasErrors('percentage');
    }

    public function test_admin_kampus_from_same_university_can_access_create_page()
    {
        $role = Role::updateOrCreate(
            ['name' => 'Admin Kampus'],
            ['display_name' => 'Admin Kampus']
        );

        $adminKampus = User::factory()->create([
            'role_id' => $role->id,
            'university_id' => $this->contract->university_id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminKampus)
            ->get(route('finance.funding.create', $this->contract->id));

        $response->assertStatus(200);
    }

    public function test_admin_kampus_from_different_university_cannot_access_create_page()
    {
        $role = Role::updateOrCreate(
            ['name' => 'Admin Kampus'],
            ['display_name' => 'Admin Kampus']
        );

        $otherUniversity = University::factory()->create();

        $adminKampus = User::factory()->create([
            'role_id' => $role->id,
            'university_id' => $otherUniversity->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminKampus)
            ->get(route('finance.funding.create', $this->contract->id));

        $response->assertStatus(403);
    }

    public function test_other_roles_cannot_access_create_page()
    {
        $role = Role::updateOrCreate(
            ['name' => 'Dosen'],
            ['display_name' => 'Dosen']
        );

        $dosen = User::factory()->create([
            'role_id' => $role->id,
            'university_id' => $this->contract->university_id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($dosen)
            ->get(route('finance.funding.create', $this->contract->id));

        $response->assertStatus(403);
    }
}
