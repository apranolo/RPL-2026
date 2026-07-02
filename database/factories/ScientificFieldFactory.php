<?php

namespace Database\Factories;

use App\Models\ScientificField;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScientificField>
 */
class ScientificFieldFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ScientificField::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fieldNames = [
            'Computer Science',
            'Physics',
            'Mathematics',
            'Biology',
            'Chemistry',
            'Engineering',
            'Medicine',
            'Psychology',
            'Economics',
            'Social Sciences',
            'Environmental Science',
            'Agricultural Science',
            'Education',
            'Law',
            'Business Administration',
        ];

        return [
            'code' => strtoupper($this->faker->unique()->lexify('???')).$this->faker->unique()->numberBetween(100, 999),
            'name' => $this->faker->unique()->randomElement($fieldNames),
            'description' => $this->faker->optional(0.7)->sentence(12),
            'parent_id' => null, // Default to root level
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the field is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the field has a parent (is a sub-category).
     */
    public function withParent(?int $parentId = null): static
    {
        return $this->state(function (array $attributes) use ($parentId) {
            return [
                'parent_id' => $parentId ?? ScientificField::factory(),
            ];
        });
    }

    /**
     * Create a root-level field (no parent).
     */
    public function rootLevel(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
        ]);
    }
}
