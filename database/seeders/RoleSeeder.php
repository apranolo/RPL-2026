<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => Role::SUPER_ADMIN,
                'display_name' => 'Super Administrator',
                'description' => 'Memiliki akses penuh ke seluruh sistem. Dapat mengelola semua PTM, Admin Kampus, dan melihat seluruh data jurnal.',
            ],
            [
                'name' => Role::ADMIN_KAMPUS,
                'display_name' => 'Administrator Kampus',
                'description' => 'Bertanggung jawab mengelola data jurnal di tingkat kampus. Dapat meninjau, menyetujui, atau menolak jurnal yang diajukan oleh PTM di kampusnya.',
            ],
            [
                'name' => Role::USER,
                'display_name' => 'User',
                'description' => 'User biasa yang dapat mengelola jurnal. Legacy role untuk backward compatibility.',
            ],
            [
                'name' => Role::PENGELOLA_JURNAL,
                'display_name' => 'Pengelola Jurnal',
                'description' => 'Mengelola jurnal yang ditugaskan. Dapat melakukan self-assessment dan mengajukan pembinaan.',
            ],
            [
                'name' => Role::REVIEWER,
                'display_name' => 'Reviewer',
                'description' => 'Dapat melakukan review terhadap assessment jurnal dan memberikan feedback kepada pengelola jurnal.',
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        $this->command->info('Roles seeded successfully.');
    }
}
