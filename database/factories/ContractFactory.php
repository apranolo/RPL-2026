<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\Proposal;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    protected $model = Contract::class;

    public function definition(): array
    {
        return [
            'university_id' => University::factory(),
            'proposal_id' => Proposal::factory(),
            'contract_number' => 'KTR-' . $this->faker->unique()->numerify('####'),
            'title' => $this->faker->sentence,
            'status' => Contract::STATUS_ACTIVE,
            'contract_value' => $this->faker->randomFloat(2, 1000000, 100000000),
            'party_1' => 'LPPM',
            'party_2' => $this->faker->name,
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'created_by' => User::factory(),
        ];
    }
}
