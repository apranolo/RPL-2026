<?php

namespace Database\Factories;

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proposal>
 *
 * Factory untuk menghasilkan data dummy Proposal penelitian.
 * Mendukung named states agar seeder dapat membuat proposal per-status.
 *
 * @method static \Illuminate\Database\Eloquent\Factories\Factory draft()
 * @method static \Illuminate\Database\Eloquent\Factories\Factory submitted()
 * @method static \Illuminate\Database\Eloquent\Factories\Factory valid()
 * @method static \Illuminate\Database\Eloquent\Factories\Factory rejected()
 */
class ProposalFactory extends Factory
{
    protected $model = Proposal::class;

    // ─── Judul penelitian realistis ───────────────────────────────────────────

    private static array $researchTitles = [
        'Pengembangan Sistem Informasi Manajemen Berbasis Web untuk UMKM',
        'Analisis Efektivitas Metode Pembelajaran Berbasis Proyek pada Mahasiswa Teknik',
        'Implementasi Machine Learning untuk Deteksi Dini Penyakit Tanaman Padi',
        'Studi Komparatif Algoritma Klasifikasi Data pada Dataset Kesehatan',
        'Rancang Bangun Aplikasi Mobile untuk Pemantauan Kualitas Udara Real-Time',
        'Optimasi Jaringan Distribusi Logistik Menggunakan Algoritma Genetika',
        'Pemanfaatan IoT dalam Sistem Irigasi Cerdas untuk Pertanian Presisi',
        'Analisis Sentimen Media Sosial terhadap Kebijakan Publik dengan NLP',
        'Pengembangan Model Prediksi Cuaca Berbasis Deep Learning untuk Daerah Tropis',
        'Sistem Rekomendasi Konten Adaptif Menggunakan Collaborative Filtering',
        'Evaluasi Keamanan Siber pada Infrastruktur Kritis Sektor Energi',
        'Desain Antarmuka Pengguna Adaptif untuk Aksesibilitas Lansia Digital',
        'Kajian Pemanfaatan Blockchain dalam Rantai Pasok Produk Pertanian',
        'Pengembangan Chatbot Berbasis NLP untuk Layanan Akademik Perguruan Tinggi',
        'Analisis Performa Arsitektur Microservices pada Sistem Skala Besar',
    ];

    // ─── Definition ───────────────────────────────────────────────────────────

    /**
     * State default — status acak dari semua kemungkinan.
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement([
            Proposal::STATUS_DRAFT,
            Proposal::STATUS_SUBMITTED,
            Proposal::STATUS_ADMINISTRASI_VALID,
            Proposal::STATUS_DITOLAK,
        ]);

        return [
            'title'                 => $this->faker->randomElement(self::$researchTitles),
            'description'           => $this->faker->paragraph(4),
            'user_id'               => User::inRandomOrder()->first()?->id ?? 1,
            'research_schema_id'    => ResearchSchema::inRandomOrder()->first()?->id ?? 1,
            'status_proposal'       => $status,
            'rejection_reason'      => $status === Proposal::STATUS_DITOLAK
                                        ? $this->faker->sentence(12)
                                        : null,
            'file_dokumen_proposal' => 'proposals/dummy_proposal.pdf',
        ];
    }

    // ─── Named States ─────────────────────────────────────────────────────────

    /** Proposal masih dalam kondisi Draft (belum disubmit). */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_proposal'  => Proposal::STATUS_DRAFT,
            'rejection_reason' => null,
        ]);
    }

    /** Proposal sudah disubmit, menunggu verifikasi admin. */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_proposal'  => Proposal::STATUS_SUBMITTED,
            'rejection_reason' => null,
        ]);
    }

    /** Proposal sudah divalidasi administrasi. */
    public function valid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_proposal'  => Proposal::STATUS_ADMINISTRASI_VALID,
            'rejection_reason' => null,
        ]);
    }

    /** Proposal ditolak oleh admin beserta alasan penolakan. */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_proposal'  => Proposal::STATUS_DITOLAK,
            'rejection_reason' => $this->faker->sentence(12),
        ]);
    }
}
