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
            'name' => $this->faker->unique()->word(),
            'description' => $this->faker->sentence,
        ];
    }
}
