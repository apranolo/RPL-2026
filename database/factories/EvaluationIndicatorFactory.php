<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationIndicator>
 */
class EvaluationIndicatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sub_category_id' => \App\Models\EvaluationSubCategory::factory(),
            'code' => 'I'.fake()->unique()->numberBetween(1, 999),
            'question' => fake()->sentence(8).'?',
            'description' => fake()->paragraph(),
            'weight' => fake()->randomFloat(2, 0, 100),
            'answer_type' => fake()->randomElement(['boolean', 'scale', 'text']),
            'requires_attachment' => fake()->boolean(30),
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => fake()->boolean(80),
            // Legacy fields for backward compatibility
            'category' => null,
            'sub_category' => null,
        ];
    }

    /**
     * Indicate that the indicator is legacy (v1.0).
     */
    public function legacy(): static
    {
        return $this->state(fn (array $attributes) => [
            'sub_category_id' => null,
            'category' => fake()->words(3, true),
            'sub_category' => fake()->words(3, true),
        ]);
    }
}
