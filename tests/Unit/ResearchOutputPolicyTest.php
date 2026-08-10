<?php

namespace Tests\Unit;

use App\Models\Contract;
use App\Models\Proposal;
use App\Models\ResearchOutput;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Policies\ResearchOutputPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchOutputPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ResearchOutputPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new ResearchOutputPolicy();
    }

    private function createContract(User $user, University $univ): Contract
    {
        $schema = ResearchSchema::create(['name' => 'Skema '.rand(1, 999), 'description' => 'Desc']);
        $proposal = Proposal::create([
            'title' => 'Proposal '.rand(1, 999),
            'description' => 'Deskripsi Proposal',
            'user_id' => $user->id,
            'research_schema_id' => $schema->id,
        ]);

        return Contract::create([
            'contract_number' => 'KON-2026-'.rand(1000, 9999),
            'title' => 'Kontrak Riset',
            'proposal_id' => $proposal->id,
            'university_id' => $univ->id,
            'contract_value' => 100000000,
            'status' => 'active',
            'party_1' => 'LPPM',
            'party_2' => $user->name,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);
    }

    public function test_super_admin_can_update_and_delete_any_output(): void
    {
        $superAdminRole = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super Admin']);
        $userRole = Role::create(['name' => Role::USER, 'display_name' => 'User']);
        $univ = University::create(['name' => 'Univ A', 'code' => 'UNA', 'city' => 'City A']);

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $superAdminRole->id,
        ]);

        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $univ->id,
        ]);

        $contract = $this->createContract($owner, $univ);

        $output = ResearchOutput::create([
            'user_id' => $owner->id,
            'contract_id' => $contract->id,
            'jenis_luaran' => 'Jurnal',
            'judul_luaran' => 'Luaran Riset 1',
        ]);

        $this->assertTrue($this->policy->update($superAdmin, $output));
        $this->assertTrue($this->policy->delete($superAdmin, $output));
    }

    public function test_user_can_update_and_delete_own_output_only(): void
    {
        $userRole = Role::create(['name' => Role::USER, 'display_name' => 'User']);
        $univ = University::create(['name' => 'Univ A', 'code' => 'UNA', 'city' => 'City A']);

        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $univ->id,
        ]);

        $otherUser = User::create([
            'name' => 'Other',
            'email' => 'other@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $univ->id,
        ]);

        $contract = $this->createContract($owner, $univ);

        $output = ResearchOutput::create([
            'user_id' => $owner->id,
            'contract_id' => $contract->id,
            'jenis_luaran' => 'Jurnal',
            'judul_luaran' => 'Luaran Riset 1',
        ]);

        $this->assertTrue($this->policy->update($owner, $output));
        $this->assertTrue($this->policy->delete($owner, $output));

        $this->assertFalse($this->policy->update($otherUser, $output));
        $this->assertFalse($this->policy->delete($otherUser, $output));
    }

    public function test_admin_kampus_can_update_and_delete_same_university_output(): void
    {
        $adminKampusRole = Role::create(['name' => Role::ADMIN_KAMPUS, 'display_name' => 'Admin Kampus']);
        $userRole = Role::create(['name' => Role::USER, 'display_name' => 'User']);

        $univ1 = University::create(['name' => 'Univ A', 'code' => 'UNA', 'city' => 'City A']);
        $univ2 = University::create(['name' => 'Univ B', 'code' => 'UNB', 'city' => 'City B']);

        $adminKampus1 = User::create([
            'name' => 'Admin Univ A',
            'email' => 'admin.a@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminKampusRole->id,
            'university_id' => $univ1->id,
        ]);

        $dosen1 = User::create([
            'name' => 'Dosen Univ A',
            'email' => 'dosen.a@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $univ1->id,
        ]);

        $dosen2 = User::create([
            'name' => 'Dosen Univ B',
            'email' => 'dosen.b@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $univ2->id,
        ]);

        $contract1 = $this->createContract($dosen1, $univ1);
        $contract2 = $this->createContract($dosen2, $univ2);

        $output1 = ResearchOutput::create([
            'user_id' => $dosen1->id,
            'contract_id' => $contract1->id,
            'jenis_luaran' => 'Jurnal',
            'judul_luaran' => 'Luaran A',
        ]);

        $output2 = ResearchOutput::create([
            'user_id' => $dosen2->id,
            'contract_id' => $contract2->id,
            'jenis_luaran' => 'Jurnal',
            'judul_luaran' => 'Luaran B',
        ]);

        $this->assertTrue($this->policy->update($adminKampus1, $output1));
        $this->assertTrue($this->policy->delete($adminKampus1, $output1));

        $this->assertFalse($this->policy->update($adminKampus1, $output2));
        $this->assertFalse($this->policy->delete($adminKampus1, $output2));
    }
}
