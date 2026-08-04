<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\Proposal;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * ContractFactory
 *
 * Provides test-ready Contract instances for Pest / PHPUnit feature tests.
 *
 * @extends Factory<Contract>
 */
class ContractFactory extends Factory
{
    /** @var class-string<Contract> */
    protected $model = Contract::class;

    private static int $contractSequence = 0;

    public function definition(): array
    {
        static::$contractSequence++;
        $year = now()->year;

        return [
            'contract_number' => sprintf('KON-%d-%04d', $year, static::$contractSequence),
            'title' => $this->faker->sentence(6),
            'proposal_id' => Proposal::factory(),
            'party_1' => $this->faker->company(),
            'party_2' => $this->faker->name(),
            'pembinaan_registration_id' => null,
            'journal_id' => null,
            'university_id' => University::factory(),
            'start_date' => now()->addDays(7),
            'end_date' => now()->addMonths(12),
            'status' => 'draft',
            'terms' => $this->faker->optional(0.6)->paragraphs(2, true),
            'notes' => $this->faker->optional(0.4)->sentence(),
            'contract_value' => $this->faker->numberBetween(50_000_000, 500_000_000),
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }

    /** State: contract in draft status. */
    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }

    /** State: contract that is active. */
    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    /** State: contract that is selesai (terminal). */
    public function selesai(): static
    {
        return $this->state(['status' => 'selesai']);
    }

    /** State: contract that is dibatalkan. */
    public function dibatalkan(): static
    {
        return $this->state(['status' => 'dibatalkan']);
    }

    /** Set contract_value explicitly. */
    public function withValue(float|int $value): static
    {
        return $this->state(['contract_value' => $value]);
    }
}
