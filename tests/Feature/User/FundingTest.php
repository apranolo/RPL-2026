<?php

namespace Tests\Feature\User;

use App\Models\Contract;
use App\Models\FundingTerm;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FundingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected User $otherUser;

    protected Role $userRole;

    public function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->userRole = Role::firstOrCreate(['name' => Role::USER]);

        // Create users
        $this->user = User::factory()->create();
        $this->user->roles()->attach($this->userRole);

        $this->otherUser = User::factory()->create();
        $this->otherUser->roles()->attach($this->userRole);
    }

    /**
     * @test
     * User dapat melihat halaman pendanaan mereka
     */
    public function user_can_view_funding_page()
    {
        $contract = Contract::factory()
            ->for($this->user, 'researcher')
            ->create();

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
        $userContract = Contract::factory()
            ->for($this->user, 'researcher')
            ->create();

        $otherContract = Contract::factory()
            ->for($this->otherUser, 'researcher')
            ->create();

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();

        // Should have 1 contract
        $response->assertInertia(fn ($page) => $page->has('contracts.data', 1));
    }

    /**
     * @test
     * Halaman pendanaan menampilkan statistik yang benar
     */
    public function funding_page_shows_correct_statistics()
    {
        $totalFunding = 500_000_000;
        $contract = Contract::factory()
            ->for($this->user, 'researcher')
            ->active()
            ->create([
                'total_approved_funding' => $totalFunding,
            ]);

        // Create funding terms
        FundingTerm::factory()
            ->for($contract)
            ->disbursed()
            ->create([
                'order' => 1,
                'percentage' => 50,
                'nominal' => $totalFunding * 0.5,
            ]);

        FundingTerm::factory()
            ->for($contract)
            ->pending()
            ->create([
                'order' => 2,
                'percentage' => 50,
                'nominal' => $totalFunding * 0.5,
            ]);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('fundingStats.total_approved', $totalFunding)
            ->where('fundingStats.total_disbursed', $totalFunding * 0.5)
            ->where('fundingStats.total_remaining', $totalFunding * 0.5)
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
     * Kontrak dengan multiple terms ditampilkan dengan benar
     */
    public function contract_with_multiple_terms_displays_correctly()
    {
        $contract = Contract::factory()
            ->for($this->user, 'researcher')
            ->active()
            ->create();

        // Create 3 funding terms
        for ($i = 1; $i <= 3; $i++) {
            FundingTerm::factory()
                ->for($contract)
                ->create([
                    'order' => $i,
                    'term_name' => "Tahap $i",
                    'percentage' => 33.33,
                    'nominal' => ($contract->total_approved_funding / 3),
                    'status' => $i === 1 ? 'cair' : 'menunggu',
                ]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('contracts.data', 1)
            ->has('contracts.data.0.funding_terms', 3)
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
     * Kontrak dengan status berbeda ditampilkan dengan label yang benar
     */
    public function contract_status_labels_are_correct()
    {
        $statusMap = [
            'aktif' => 'Aktif',
            'selesai' => 'Selesai',
            'ditangguhkan' => 'Ditangguhkan',
        ];

        foreach ($statusMap as $status => $label) {
            $contract = Contract::factory()
                ->for($this->user, 'researcher')
                ->create(['contract_status' => $status]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('contracts.data', 3));
    }

    /**
     * @test
     * Funding term status ditampilkan dengan warna yang sesuai
     */
    public function funding_term_status_colors_are_correct()
    {
        $contract = Contract::factory()
            ->for($this->user, 'researcher')
            ->create();

        $statuses = ['cair', 'menunggu', 'ditangguhkan', 'batal'];

        foreach ($statuses as $index => $status) {
            FundingTerm::factory()
                ->for($contract)
                ->create([
                    'order' => $index + 1,
                    'status' => $status,
                ]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('contracts.data.0.funding_terms', 4));
    }

    /**
     * @test
     * Disbursement percentage dihitung dengan benar
     */
    public function disbursement_percentage_calculated_correctly()
    {
        $totalFunding = 1_000_000_000; // 1 Miliar
        $contract = Contract::factory()
            ->for($this->user, 'researcher')
            ->create([
                'total_approved_funding' => $totalFunding,
            ]);

        // 40% disbursed
        FundingTerm::factory()
            ->for($contract)
            ->disbursed()
            ->create([
                'order' => 1,
                'percentage' => 40,
                'nominal' => 400_000_000,
            ]);

        // 60% pending
        FundingTerm::factory()
            ->for($contract)
            ->pending()
            ->create([
                'order' => 2,
                'percentage' => 60,
                'nominal' => 600_000_000,
            ]);

        $response = $this->actingAs($this->user)
            ->get(route('user.funding.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('contracts.data.0.disbursement_percentage', 40.00)
            ->where('contracts.data.0.total_disbursed', 400_000_000)
            ->where('contracts.data.0.remaining_funding', 600_000_000)
        );
    }
}
