<?php

namespace Database\Factories;

use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationCategory>
 */
class EvaluationCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'template_id' => AccreditationTemplate::factory(),
            'code' => 'K'.fake()->unique()->numberBetween(1, 99),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'weight' => fake()->randomFloat(2, 0, 100),
            'display_order' => fake()->numberBetween(1, 10),
        ];
    }
}
