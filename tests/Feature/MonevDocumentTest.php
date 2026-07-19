<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonevDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_print_rekap_is_accessible_by_super_admin()
    {
        $roleId = Role::where('name', Role::SUPER_ADMIN)->value('id');
        $superAdmin = User::factory()->create(['role_id' => $roleId]);

        $response = $this->actingAs($superAdmin)->get(route('monev.printRekap'));

        $response->assertStatus(200);
        $response->assertViewIs('print.evaluasi');
        $response->assertViewHas('evaluations');
    }

    public function test_print_rekap_filters_by_admin_kampus_university()
    {
        $university1 = University::factory()->create();
        $university2 = University::factory()->create();

        $roleId = Role::where('name', Role::ADMIN_KAMPUS)->value('id');
        $adminKampus = User::factory()->create([
            'role_id' => $roleId,
            'university_id' => $university1->id,
        ]);

        $journal1 = Journal::factory()->create(['university_id' => $university1->id]);
        $journal2 = Journal::factory()->create(['university_id' => $university2->id]);

        JournalAssessment::factory()->create(['journal_id' => $journal1->id]);
        JournalAssessment::factory()->create(['journal_id' => $journal2->id]);

        $response = $this->actingAs($adminKampus)->get(route('monev.printRekap'));

        $response->assertStatus(200);
        $evaluations = $response->viewData('evaluations');

        $this->assertCount(1, $evaluations);
        $this->assertEquals($journal1->id, $evaluations->first()->journal_id);
    }

    public function test_print_rekap_filters_by_user()
    {
        $roleId = Role::where('name', Role::USER)->value('id');
        $user1 = User::factory()->create(['role_id' => $roleId]);
        $user2 = User::factory()->create(['role_id' => $roleId]);

        JournalAssessment::factory()->create(['user_id' => $user1->id]);
        JournalAssessment::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->get(route('monev.printRekap'));

        $response->assertStatus(200);
        $evaluations = $response->viewData('evaluations');

        $this->assertCount(1, $evaluations);
        $this->assertEquals($user1->id, $evaluations->first()->user_id);
    }
}
