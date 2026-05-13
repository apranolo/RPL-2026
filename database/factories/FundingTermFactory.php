<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\FundingTerm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FundingTerm>
 */
class FundingTermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contract = Contract::inRandomOrder()->first() ?? Contract::factory()->create();
        $percentage = fake()->numberBetween(20, 50);

        return [
            'contract_id' => $contract->id,
            'order' => fake()->numberBetween(1, 4),
            'term_name' => 'Tahap ' . fake()->numberBetween(1, 4),
            'percentage' => $percentage,
            'nominal' => ($contract->total_approved_funding * $percentage) / 100,
            'status' => fake()->randomElement(['cair', 'menunggu', 'ditangguhkan', 'batal']),
            'disbursement_date' => fake()->optional()->dateTimeBetween('-1 month'),
            'receipt_number' => fake()->optional()->word(),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the funding term is disbursed.
     */
    public function disbursed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cair',
            'disbursement_date' => fake()->dateTimeBetween('-30 days'),
            'receipt_number' => 'RCP-' . date('Y') . '-' . str_pad(fake()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Indicate that the funding term is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'menunggu',
            'disbursement_date' => null,
            'receipt_number' => null,
        ]);
    }

    /**
     * Indicate that the funding term is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ditangguhkan',
            'disbursement_date' => null,
        ]);
    }

    /**
     * Indicate that the funding term is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'batal',
            'disbursement_date' => null,
        ]);
    }
}
