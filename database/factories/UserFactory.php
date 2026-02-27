<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
            'approval_status' => 'approved',
            // Note: role_id should be explicitly set when creating users
            // Tests should create roles first, then pass role_id to factory
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user should have the Super Admin role.
     */
    public function superAdmin(): static
    {
        return $this->state(function (array $attributes) {
            $roleId = \DB::table('roles')->where('name', Role::SUPER_ADMIN)->value('id');

            return [
                'role_id' => $roleId,
                'university_id' => null,
            ];
        });
    }

    /**
     * Indicate that the user should have the Admin Kampus role.
     */
    public function adminKampus(?int $universityId = null): static
    {
        return $this->state(function (array $attributes) use ($universityId) {
            $roleId = \DB::table('roles')->where('name', Role::ADMIN_KAMPUS)->value('id');

            return [
                'role_id' => $roleId,
                'university_id' => $universityId,
            ];
        });
    }

    /**
     * Indicate that the user should have the User (Journal Manager) role.
     */
    public function user(?int $universityId = null): static
    {
        return $this->state(function (array $attributes) use ($universityId) {
            $roleId = \DB::table('roles')->where('name', Role::USER)->value('id');

            return [
                'role_id' => $roleId,
                'university_id' => $universityId,
            ];
        });
    }
}
