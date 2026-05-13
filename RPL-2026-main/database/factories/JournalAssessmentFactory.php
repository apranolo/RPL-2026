<?php

namespace Database\Factories;

use App\Models\Journal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalAssessment>
 */
class JournalAssessmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $journal = Journal::factory()->create();

        return [
            'journal_id' => $journal->id,
            'user_id' => $journal->user_id, // Same user who owns the journal
            'assessment_date' => fake()->date(),
            'period' => fake()->year().'-Q'.fake()->numberBetween(1, 4),
            'status' => fake()->randomElement(['draft', 'submitted', 'reviewed']),
            'total_score' => fake()->numberBetween(70, 100),
            'max_score' => 100,
            'percentage' => fake()->numberBetween(70, 100),
            'notes' => fake()->optional()->paragraph(),
            'submitted_at' => null,
            'reviewed_at' => null,
            'reviewed_by' => null,
        ];
    }

    /**
     * Indicate that the assessment is submitted
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Indicate that the assessment is reviewed (approved by Admin Kampus)
     */
    public function reviewed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reviewed',
            'submitted_at' => now()->subDays(2),
            'reviewed_at' => now(),
            'reviewed_by' => User::factory()->adminKampus()->create()->id,
        ]);
    }
}
