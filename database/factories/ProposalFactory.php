<?php

namespace Database\Factories;

use App\Models\ResearchSchema;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proposal>
 */
class ProposalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'user_id' => \App\Models\User::inRandomOrder()->first()->id ?? 1,
            'research_schema_id' => ResearchSchema::inRandomOrder()->first()->id ?? 1,
        ];
    }
}
