<?php

namespace Database\Factories;

use App\Models\Proposal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proposal>
 */
class ProposalFactory extends Factory
{
    protected $model = Proposal::class;

    public function definition(): array
    {
        return [
            'judul' => fake()->sentence(6),
            'deskripsi' => fake()->paragraph(),
        ];
    }
}