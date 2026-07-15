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
            'contract_number' => $this->faker->unique()->numerify('CONTRACT-####'),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'status' => 'draft',
            'contract_value' => $this->faker->randomFloat(2, 5000000, 50000000),
            'party_1' => $this->faker->name(),
            'party_2' => $this->faker->name(),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
