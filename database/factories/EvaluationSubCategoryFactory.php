<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationSubCategory>
 */
class EvaluationSubCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => \App\Models\EvaluationCategory::factory(),
            'code' => 'SK'.fake()->unique()->numberBetween(1, 99),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'display_order' => fake()->numberBetween(1, 10),
        ];
    }
}
