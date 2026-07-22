<?php

namespace Database\Factories;

use App\Models\ResearchSchema;
use App\Models\User;
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
        $status = $this->faker->randomElement(['Draft', 'Submitted', 'Administrasi_Valid', 'Ditolak']);

        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'user_id' => User::factory(),
            'research_schema_id' => ResearchSchema::factory(),
            'status_proposal' => $status,
            'rejection_reason' => $status === 'Ditolak' ? $this->faker->sentence : null,
            'file_dokumen_proposal' => 'proposals/dummy_proposal.pdf',
        ];
    }
}
