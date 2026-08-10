<?php

namespace Tests\Unit;

use App\Models\Contract;
use App\Models\MonevSchedule;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonevScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_monev_schedule_creation_and_relations(): void
    {
        $university = University::create([
            'name' => 'Universitas Ahmad Dahlan',
            'code' => 'UAD',
            'city' => 'Yogyakarta',
            'is_active' => true,
        ]);

        $userRole = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $evaluator = User::create([
            'name' => 'Prof. Dr. Budi',
            'email' => 'evaluator@uad.ac.id',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
        ]);

        $dosen = User::create([
            'name' => 'Dr. Andi',
            'email' => 'dosen@uad.ac.id',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
        ]);

        $schema = ResearchSchema::create([
            'name' => 'Riset Dasar',
            'description' => 'Deskripsi',
        ]);

        $proposal = Proposal::create([
            'title' => 'Penelitian IoT',
            'description' => 'Deskripsi Penelitian',
            'user_id' => $dosen->id,
            'research_schema_id' => $schema->id,
            'status_proposal' => 'Diterima',
        ]);

        $contract = Contract::create([
            'contract_number' => 'KON-2026-999',
            'title' => 'Kontrak Hibah Riset',
            'proposal_id' => $proposal->id,
            'university_id' => $university->id,
            'contract_value' => 100000000,
            'status' => 'active',
            'party_1' => 'LPPM',
            'party_2' => 'Dr. Andi',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $schedule = MonevSchedule::create([
            'contract_id' => $contract->id,
            'evaluator_id' => $evaluator->id,
            'date' => '2026-06-15',
            'time' => '09:00:00',
            'location' => 'Ruang Rapat LPPM',
            'status' => 'scheduled',
        ]);

        $this->assertEquals($contract->id, $schedule->contract->id);
        $this->assertEquals($evaluator->id, $schedule->evaluator->id);
        $this->assertTrue($schedule->isScheduled());
        $this->assertFalse($schedule->isDone());
        $this->assertEquals('Terjadwal', $schedule->status_label);
        $this->assertTrue($contract->monevSchedules->contains($schedule));
        $this->assertTrue($evaluator->monevSchedules->contains($schedule));
    }
}
