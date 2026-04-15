<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccreditationTemplate>
 */
class AccreditationTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true).' Template',
            'description' => fake()->sentence(12),
            'version' => '1.0',
            'type' => fake()->randomElement(['akreditasi', 'indeksasi']),
            'is_active' => fake()->boolean(70), // 70% chance of being active
            'effective_date' => fake()->dateTimeBetween('-1 year', '+1 year'),
        ];
    }

    /**
     * Indicate that the template is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the template is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the template is for accreditation.
     */
    public function akreditasi(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'akreditasi',
        ]);
    }

    /**
     * Indicate that the template is for indexation.
     */
    public function indeksasi(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'indeksasi',
        ]);
    }
}
