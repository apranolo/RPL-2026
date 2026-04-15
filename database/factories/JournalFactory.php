<?php

namespace Database\Factories;

use App\Models\ScientificField;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Journal>
 */
class JournalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $university = \App\Models\University::factory()->create();
        $user = \App\Models\User::factory()->user($university->id)->create();

        return [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'title' => $this->faker->sentence(4),
            'issn' => $this->faker->numerify('####-####'),
            'e_issn' => $this->faker->numerify('####-####'),
            'publisher' => $this->faker->company(),
            'is_active' => true,
            'indexations' => null,
            'sinta_rank' => 'non_sinta', // Default to non_sinta (as per DB schema)
            'scientific_field_id' => null,
        ];
    }

    /**
     * Indicate journal is indexed in Scopus.
     */
    public function scopusIndexed(): static
    {
        return $this->state(fn (array $attributes) => [
            'indexations' => ['Scopus' => true],
        ]);
    }

    /**
     * Indicate journal is indexed in Web of Science.
     */
    public function wosIndexed(): static
    {
        return $this->state(fn (array $attributes) => [
            'indexations' => ['Web of Science' => true],
        ]);
    }

    /**
     * Indicate journal is indexed in DOAJ.
     */
    public function doajIndexed(): static
    {
        return $this->state(fn (array $attributes) => [
            'indexations' => ['DOAJ' => true],
        ]);
    }

    /**
     * Indicate journal is indexed in Google Scholar.
     */
    public function googleScholarIndexed(): static
    {
        return $this->state(fn (array $attributes) => [
            'indexations' => ['Google Scholar' => true],
        ]);
    }

    /**
     * Indicate journal is indexed in multiple platforms.
     */
    public function multipleIndexations(?array $platforms = null): static
    {
        $platforms = $platforms ?? ['Scopus', 'Google Scholar', 'DOAJ'];
        $indexations = [];

        foreach ($platforms as $platform) {
            $indexations[$platform] = true;
        }

        return $this->state(fn (array $attributes) => [
            'indexations' => $indexations,
        ]);
    }

    /**
     * Indicate journal has random indexation(s).
     */
    public function randomIndexations(): static
    {
        $platforms = ['Scopus', 'Web of Science', 'DOAJ', 'Google Scholar', 'PubMed', 'Sinta'];
        $selected = $this->faker->randomElements($platforms, $this->faker->numberBetween(1, 3));

        $indexations = [];
        foreach ($selected as $platform) {
            $indexations[$platform] = true;
        }

        return $this->state(fn (array $attributes) => [
            'indexations' => $indexations,
        ]);
    }

    /**
     * Indicate journal has specific SINTA rank (format: 'sinta_1' to 'sinta_6', or 'non_sinta').
     */
    public function sintaRanked(string $rank): static
    {
        // Normalize input - accept both '1' and 'sinta_1' format
        if (preg_match('/^[1-6]$/', $rank)) {
            $rank = "sinta_{$rank}";
        }

        return $this->state(fn (array $attributes) => [
            'sinta_rank' => $rank,
        ]);
    }

    /**
     * Indicate journal has random SINTA rank (sinta_1 to sinta_6).
     */
    public function randomSintaRank(): static
    {
        $rank = $this->faker->numberBetween(1, 6);

        return $this->state(fn (array $attributes) => [
            'sinta_rank' => "sinta_{$rank}",
        ]);
    }

    /**
     * Indicate journal is not SINTA accredited.
     */
    public function nonSinta(): static
    {
        return $this->state(fn (array $attributes) => [
            'sinta_rank' => 'non_sinta',
        ]);
    }

    /**
     * Associate journal with a specific scientific field.
     */
    public function withScientificField(int|ScientificField $field): static
    {
        $fieldId = $field instanceof ScientificField ? $field->id : $field;

        return $this->state(fn (array $attributes) => [
            'scientific_field_id' => $fieldId,
        ]);
    }

    /**
     * Associate journal with a random scientific field.
     */
    public function withRandomScientificField(): static
    {
        $field = ScientificField::inRandomOrder()->first()
                    ?? ScientificField::factory()->create();

        return $this->state(fn (array $attributes) => [
            'scientific_field_id' => $field->id,
        ]);
    }

    /**
     * Create complete journal for statistics testing with all attributes.
     */
    public function complete(): static
    {
        return $this->state(function (array $attributes) {
            $field = ScientificField::inRandomOrder()->first()
                        ?? ScientificField::factory()->create();

            // 70% chance of being indexed in Scopus
            $hasScopus = $this->faker->boolean(70);

            // Random additional indexations
            $platforms = ['Google Scholar', 'DOAJ'];
            if ($hasScopus) {
                $platforms[] = 'Scopus';
            }
            if ($this->faker->boolean(30)) {
                $platforms[] = 'Web of Science';
            }

            $indexations = [];
            foreach ($platforms as $platform) {
                $indexations[$platform] = true;
            }

            // 60% chance of having SINTA rank
            $sintaRank = $this->faker->boolean(60)
                ? 'sinta_'.$this->faker->numberBetween(1, 6)
                : 'non_sinta';

            return [
                'indexations' => $indexations,
                'sinta_rank' => $sintaRank,
                'scientific_field_id' => $field->id,
            ];
        });
    }
}
