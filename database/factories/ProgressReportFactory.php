<?php

namespace Database\Factories;

use App\Models\ProgressReport;
use App\Models\Proposal;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProgressReportFactory extends Factory
{
    protected $model = ProgressReport::class;

    public function definition(): array
    {
        return [
            'proposal_id' => Proposal::factory(),
            'contract_id' => Contract::factory(),
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'report_type' => 'laporan_kemajuan',
            'report_date' => $this->faker->date(),
            'progress_percentage' => $this->faker->numberBetween(0, 100),
            'report_period' => '2026',
            'status' => 'draft',
        ];
    }
}
