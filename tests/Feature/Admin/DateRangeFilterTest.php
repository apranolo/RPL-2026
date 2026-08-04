<?php

namespace Tests\Feature\Admin;

use App\Models\JournalAssessment;
use App\Models\Proposal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DateRangeFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        $this->superAdmin = User::factory()->create(['role_id' => $superAdminRole->id]);
        $this->superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);
    }

    public function test_proposal_summary_filters_by_date_range()
    {
        Proposal::factory()->create(['created_at' => '2025-05-15 10:00:00']);
        Proposal::factory()->create(['created_at' => '2026-02-10 10:00:00']);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.reviews.summary', [
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reviewer/Summary')
            ->has('filters', fn (Assert $filters) => $filters
                ->where('start_date', '2026-01-01')
                ->where('end_date', '2026-12-31')
                ->etc()
            )
        );
    }

    public function test_journal_summary_filters_by_date_range()
    {
        JournalAssessment::factory()->create(['submitted_at' => '2025-03-01 10:00:00']);
        JournalAssessment::factory()->create(['submitted_at' => '2026-01-20 10:00:00']);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.assessments.summary', [
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reviewer/JournalSummary')
            ->has('filters', fn (Assert $filters) => $filters
                ->where('start_date', '2026-01-01')
                ->where('end_date', '2026-12-31')
                ->etc()
            )
        );
    }
}
