<?php

namespace Database\Factories;

use App\Models\ResearchSchema;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResearchSchemaFactory extends Factory
{
    protected $model = ResearchSchema::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'max_funding' => $this->faker->randomFloat(2, 1000000, 50000000),
            'is_active' => true,
        ];
    }
}
