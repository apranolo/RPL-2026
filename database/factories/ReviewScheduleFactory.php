<?php

namespace Database\Factories;

use App\Models\JournalAssessment;
use App\Models\ReviewSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewScheduleFactory extends Factory
{
    protected $model = ReviewSchedule::class;

    public function definition(): array
    {
        $assessment = JournalAssessment::factory()->submitted()->create();

        return [
            'proposal_id' => $assessment->id,
            'reviewer_id' => User::factory()->create(['is_reviewer' => true]),
            'scheduled_at' => fake()->dateTimeBetween('+1 day', '+1 month'),
            'ended_at' => fake()->optional()->dateTimeBetween('+1 month', '+2 months'),
            'location' => fake()->optional()->streetAddress(),
            'meeting_link' => fake()->optional()->url(),
            'notes' => fake()->optional()->paragraph(),
            'status' => 'scheduled',
            'created_by' => User::factory()->superAdmin()->create()->id,
        ];
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
