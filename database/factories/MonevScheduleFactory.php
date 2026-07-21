<?php

namespace Database\Factories;

use App\Models\MonevSchedule;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MonevScheduleFactory extends Factory
{
    protected $model = MonevSchedule::class;

    public function definition(): array
    {
        return [
            'contract_id' => Contract::factory(),
            'evaluator_id' => User::factory(),
            'date' => $this->faker->date(),
            'time' => $this->faker->time(),
            'location' => $this->faker->address(),
            'status' => 'scheduled',
        ];
    }
}
