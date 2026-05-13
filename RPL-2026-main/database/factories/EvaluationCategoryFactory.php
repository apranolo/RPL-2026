<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationCategory>
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
            'template_id' => \App\Models\AccreditationTemplate::factory(),
            'code' => 'K'.fake()->unique()->numberBetween(1, 99),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'weight' => fake()->randomFloat(2, 0, 100),
            'display_order' => fake()->numberBetween(1, 10),
        ];
    }
}
