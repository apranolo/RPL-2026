<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\ResearchOutput;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResearchOutputFactory extends Factory
{
    protected $model = ResearchOutput::class;

    public function definition(): array
    {
        $jenisLuaran = $this->faker->randomElement(['Jurnal', 'Buku', 'HKI', 'Produk']);

        return [
            'contract_id' => Contract::factory(),
            'user_id' => User::factory(),
            'jenis_luaran' => $jenisLuaran,
            'judul_luaran' => $this->faker->sentence,
            'tahun_capaian' => $this->faker->year,
            'penulis_atau_pencipta' => $this->faker->name,
            'file_sertifikat_atau_cover' => null,
            'status_verifikasi' => 'Draft',
            'keterangan' => null,
            'tautan_publikasi' => null,
        ];
    }
}
