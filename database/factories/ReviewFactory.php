<?php

namespace Database\Factories;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'proposal_id' => Proposal::factory(),
            'reviewer_id' => User::factory(),
            'score' => $this->faker->randomFloat(2, 0, 100),
            'comments' => $this->faker->paragraph(),
            'recommendation' => $this->faker->randomElement(['accepted', 'revision', 'rejected']),
        ];
    }

    /**
     * Indicate that the review recommends acceptance.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommendation' => 'accepted',
            'score' => $this->faker->randomFloat(2, 70, 100),
        ]);
    }

    /**
     * Indicate that the review recommends revision.
     */
    public function revision(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommendation' => 'revision',
            'score' => $this->faker->randomFloat(2, 40, 69),
        ]);
    }

    /**
     * Indicate that the review recommends rejection.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommendation' => 'rejected',
            'score' => $this->faker->randomFloat(2, 0, 39),
        ]);
    }
}
