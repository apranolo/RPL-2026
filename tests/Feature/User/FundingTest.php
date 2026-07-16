<?php

namespace Tests\Feature\User;

use App\Models\Contract;
use App\Models\Funding;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FundingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected User $otherUser;

    protected Role $userRole;

    protected University $university;

    protected ResearchSchema $researchSchema;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->userRole = Role::firstOrCreate(['name' => Role::USER], ['display_name' => Role::USER]);

        // Create users
        $this->user = User::factory()->create();
        $this->user->roles()->attach($this->userRole);

        $this->otherUser = User::factory()->create();
        $this->otherUser->roles()->attach($this->userRole);

        $this->university = University::factory()->create();
        $this->researchSchema = ResearchSchema::create([
            'name' => 'Skema Penelitian Unggulan',
            'description' => 'Skema untuk pengujian',
        ]);
    }

    /**
     * Create a proposal owned by the given user.
     */
    private function createProposalFor(User $user): Proposal
    {
        return Proposal::factory()->create([
            'user_id' => $user->id,
            'research_schema_id' => $this->researchSchema->id,
        ]);
    }

    /**
     * Create a contract linked to a proposal owned by the given user.
     */
    private function createContractFor(User $user, array $attributes = []): Contract
    {
        $proposal = $this->createProposalFor($user);

        return Contract::create(array_merge([
            'university_id' => $this->university->id,
            'proposal_id' => $proposal->id,
            'contract_number' => 'KTK-'.now()->format('Y').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
            'title' => 'Penelitian Uji Coba',
            'contract_value' => 100_000_000,
            'status' => Contract::STATUS_ACTIVE,
            'party_1' => 'LPPM',
            'party_2' => 'Dosen',
        ], $attributes));
    }

    /**
     * @test
     * User dapat melihat halaman pendanaan mereka
     */
    public function user_can_view_funding_page()
    {
        $this->createContractFor($this->user);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Proposal/FundingInfo')
            ->has('contracts')
            ->has('fundingStats')
        );
    }

    /**
     * @test
     * User hanya melihat kontrak mereka sendiri
     */
    public function user_only_sees_their_own_contracts()
    {
        $this->createContractFor($this->user);
        $this->createContractFor($this->otherUser);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('contracts.data', 1));
    }

    /**
     * @test
     * Halaman pendanaan menampilkan statistik yang benar
     */
    public function funding_page_shows_correct_statistics()
    {
        $totalFunding = 500_000_000;
        $contract = $this->createContractFor($this->user, [
            'status' => Contract::STATUS_ACTIVE,
            'contract_value' => $totalFunding,
        ]);

        Funding::create([
            'contract_id' => $contract->id,
            'funding_number' => 'TRM-001',
            'amount' => $totalFunding * 0.5,
            'percentage' => 50,
            'status' => Funding::STATUS_DISBURSED,
        ]);

        Funding::create([
            'contract_id' => $contract->id,
            'funding_number' => 'TRM-002',
            'amount' => $totalFunding * 0.5,
            'percentage' => 50,
            'status' => Funding::STATUS_PLANNED,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('fundingStats.total_approved', $totalFunding)
            ->where('fundingStats.total_disbursed', (int) ($totalFunding * 0.5))
            ->where('fundingStats.total_remaining', (int) ($totalFunding * 0.5))
            ->where('fundingStats.active_contracts', 1)
        );
    }

    /**
     * @test
     * Guest tidak bisa akses funding page
     */
    public function guest_cannot_access_funding_page()
    {
        $response = $this->get(route('user.funding.index'));

        $response->assertRedirect(route('login'));
    }

    /**
     * @test
     * User tanpa role user tidak bisa akses
     */
    public function user_without_user_role_cannot_access()
    {
        $user = User::factory()->create();
        // Don't attach any role

        $response = $this->actingAs($user)
            ->get(route('user.funding.index'));

        $response->assertForbidden();
    }

    /**
     * @test
     * Kontrak dengan multiple fundings ditampilkan dengan benar
     */
    public function contract_with_multiple_fundings_displays_correctly()
    {
        $contract = $this->createContractFor($this->user);

        for ($i = 1; $i <= 3; $i++) {
            Funding::create([
                'contract_id' => $contract->id,
                'funding_number' => "TRM-00{$i}",
                'amount' => $contract->contract_value / 3,
                'percentage' => 33.33,
                'status' => $i === 1 ? Funding::STATUS_DISBURSED : Funding::STATUS_PLANNED,
            ]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('contracts.data', 1)
            ->has('contracts.data.0.fundings', 3)
        );
    }

    /**
     * @test
     * Empty state ditampilkan jika tidak ada kontrak
     */
    public function empty_state_shown_when_no_contracts()
    {
        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('contracts.data', 0)
            ->where('fundingStats.total_approved', 0)
            ->where('fundingStats.active_contracts', 0)
        );
    }

    /**
     * @test
     * Kontrak dengan status berbeda ditampilkan dengan benar
     */
    public function contract_status_labels_are_correct()
    {
        foreach ([Contract::STATUS_DRAFT, Contract::STATUS_ACTIVE, Contract::STATUS_COMPLETED] as $status) {
            $this->createContractFor($this->user, ['status' => $status]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('contracts.data', 3));
    }

    /**
     * @test
     * Funding dengan berbagai status ditampilkan dengan benar
     */
    public function funding_status_are_displayed_correctly()
    {
        $contract = $this->createContractFor($this->user);

        $statuses = [
            Funding::STATUS_PLANNED,
            Funding::STATUS_REQUESTED,
            Funding::STATUS_APPROVED,
            Funding::STATUS_DISBURSED,
            Funding::STATUS_CANCELLED,
        ];

        foreach ($statuses as $index => $status) {
            Funding::create([
                'contract_id' => $contract->id,
                'funding_number' => 'TRM-'.($index + 1),
                'amount' => 10_000_000,
                'percentage' => 20,
                'status' => $status,
            ]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('contracts.data.0.fundings', 5));
    }

    /**
     * @test
     * Disbursement percentage dihitung dengan benar
     */
    public function disbursement_percentage_calculated_correctly()
    {
        $totalFunding = 1_000_000_000; // 1 Miliar
        $contract = $this->createContractFor($this->user, [
            'contract_value' => $totalFunding,
        ]);

        // 40% disbursed
        Funding::create([
            'contract_id' => $contract->id,
            'funding_number' => 'TRM-001',
            'amount' => 400_000_000,
            'percentage' => 40,
            'status' => Funding::STATUS_DISBURSED,
        ]);

        // 60% pending
        Funding::create([
            'contract_id' => $contract->id,
            'funding_number' => 'TRM-002',
            'amount' => 600_000_000,
            'percentage' => 60,
            'status' => Funding::STATUS_PLANNED,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('contracts.data.0.disbursement_percentage', 40)
            ->where('contracts.data.0.total_disbursed', 400_000_000)
            ->where('contracts.data.0.remaining_funding', 600_000_000)
        );
    }
}
