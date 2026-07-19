<?php

namespace Database\Seeders;

use App\Models\Proposal;
use App\Models\Review;
use App\Models\ReviewSchedule;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate proposals
        Proposal::factory()->count(10)->create();

        // Retrieve seeded proposals, reviewers, and LPPM/Admin Kampus users
        $proposals = Proposal::all();
        $reviewers = User::where('is_reviewer', true)->get();
        if ($reviewers->isEmpty()) {
            $reviewers = User::take(3)->get();
        }
        
        $admin = User::whereHas('roles', function($q) {
            $q->where('name', Role::ADMIN_KAMPUS);
        })->first() ?? User::first();

        // Seed reviews and schedules
        foreach ($proposals as $index => $proposal) {
            $reviewer = $reviewers->random();

            if ($index < 5) {
                // Completed reviews
                Review::create([
                    'proposal_id' => $proposal->id,
                    'reviewer_id' => $reviewer->id,
                    'score' => rand(70, 95),
                    'feedback' => 'Sangat bagus, metodologi riset terperinci dan aplikatif. Topik ini sangat relevan dengan kebutuhan industri saat ini.',
                    'recommendation' => ['Diterima', 'Revisi', 'Ditolak'][$index % 3],
                    'reviewed_at' => now()->subDays(rand(1, 10)),
                ]);
            } else {
                // Schedules (assigned or in progress)
                ReviewSchedule::create([
                    'proposal_id' => $proposal->id,
                    'reviewer_id' => $reviewer->id,
                    'assigned_by' => $admin->id,
                    'assigned_at' => now()->subDays(rand(1, 5)),
                    'start_date' => now()->subDays(2),
                    'end_date' => now()->addDays(5),
                    'status' => $index % 2 == 0 ? 'in_progress' : 'assigned',
                ]);
            }
        }
    }
}
