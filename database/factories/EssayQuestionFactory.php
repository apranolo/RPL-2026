<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EssayQuestion>
 */
class EssayQuestionFactory extends Factory
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
            'code' => 'E'.fake()->unique()->numberBetween(1, 99),
            'question' => fake()->sentence(10).'?',
            'guidance' => fake()->paragraph(2),
            'max_words' => fake()->randomElement([500, 1000, 1500, 2000]),
            'is_required' => fake()->boolean(70),
            'is_active' => fake()->boolean(80),
            'display_order' => fake()->numberBetween(1, 20),
        ];
    }

    /**
     * Indicate that the essay is required.
     */
    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => true,
        ]);
    }

    /**
     * Indicate that the essay is optional.
     */
    public function optional(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => false,
        ]);
    }
}
