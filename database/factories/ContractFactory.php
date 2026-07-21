<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * ContractFactory
 *
 * Provides test-ready Contract instances for Pest / PHPUnit feature tests.
 * The factory does NOT rely on PembinaanRegistration or Journal being present,
 * so it works in isolation (those FK columns are nullable).
 *
 * @extends Factory<Contract>
 *
 * @author GILANG JA'FAR PRASETYA
 */
class ContractFactory extends Factory
{
    /** @var class-string<Contract> */
    protected $model = Contract::class;

    /**
     * Generate a unique sequential contract number for tests.
     * Real sequential generation is handled by Contract::generateContractNumber(),
     * but in tests we just need a unique, plausible value.
     */
    private static int $contractSequence = 0;

    public function definition(): array
    {
        static::$contractSequence++;
        $year = now()->year;

        return [
            'contract_number'           => sprintf('KON-%d-%04d', $year, static::$contractSequence),
            'title'                     => $this->faker->sentence(6),
            'pembinaan_registration_id' => null,
            'journal_id'                => null,
            'university_id'             => University::factory(),
            'start_date'                => now()->addDays(7),
            'end_date'                  => now()->addMonths(12),
            'status'                    => 'draft',
            'terms'                     => $this->faker->optional(0.6)->paragraphs(2, true),
            'notes'                     => $this->faker->optional(0.4)->sentence(),
            'contract_value'            => $this->faker->optional(0.7)->numberBetween(50_000_000, 500_000_000),
            'created_by'                => User::factory(),
            'updated_by'                => null,
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

    /** State: contract that has been cancelled (terminal). */
    public function dibatalkan(): static
    {
        return $this->state(['status' => 'dibatalkan']);
    }

    /** State: contract with an explicit contract value set. */
    public function withValue(int $value = 100_000_000): static
    {
        return $this->state(['contract_value' => $value]);
    }

    /** State: contract with no contract value (financial info pending). */
    public function withoutValue(): static
    {
        return $this->state(['contract_value' => null]);
    }
}
