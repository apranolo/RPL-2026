<?php

namespace Database\Factories;

use App\Models\ResearchOutput;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResearchOutput>
 */
class ResearchOutputFactory extends Factory
{
    protected $model = ResearchOutput::class;

    public function definition(): array
    {
        return [
            'proposal_id' => \App\Models\Proposal::factory(),
            'user_id' => \App\Models\User::factory(),
            'jenis_luaran' => fake()->randomElement(['Jurnal', 'Buku', 'HKI', 'Produk']),
            'judul_luaran' => fake()->sentence(4),
            'tahun_capaian' => fake()->year(),
            'file_sertifikat_atau_cover' => null,
            'status_verifikasi' => 'Draft',
            'keterangan' => fake()->optional()->paragraph(),
        ];
    }
}