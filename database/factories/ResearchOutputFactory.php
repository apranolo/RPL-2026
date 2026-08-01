<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\ResearchOutput;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchOutput>
 */
class ResearchOutputFactory extends Factory
{
    protected $model = ResearchOutput::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'contract_id' => Contract::factory(),
            'jenis_luaran' => $this->faker->randomElement(['Jurnal', 'Buku', 'HKI', 'Produk']),
            'judul_luaran' => $this->faker->sentence(),
            'tahun_capaian' => (int) $this->faker->year(),
            'penulis_atau_pencipta' => $this->faker->name(),
            'status_verifikasi' => 'Draft',
        ];
    }
}
