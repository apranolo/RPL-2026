<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get IDs from related tables
        $superAdminRoleId = DB::table('roles')->where('name', Role::SUPER_ADMIN)->value('id');
        $adminKampusRoleId = DB::table('roles')->where('name', Role::ADMIN_KAMPUS)->value('id');
        $userRoleId = DB::table('roles')->where('name', Role::USER)->value('id');

        // Get University IDs
        $uadId = DB::table('universities')->where('code', 'UAD')->value('id');
        $umyId = DB::table('universities')->where('code', 'UMY')->value('id');
        $umsId = DB::table('universities')->where('code', 'UMS')->value('id');
        $ummId = DB::table('universities')->where('code', 'UMM')->value('id');

        $users = [
            // ==================== SUPER ADMIN ====================
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@ajm.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff',
                'phone' => '081234567890',
                'position' => 'System Administrator',
                'role_id' => $superAdminRoleId,
                'university_id' => null, // Super Admin tidak terikat ke universitas
                'is_active' => true,
                'last_login_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Additional Super Admins
            [
                'name' => 'DIKTI Administrator',
                'email' => 'dikti@journalmu.org',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=DIKTI+Admin&background=0D8ABC&color=fff',
                'phone' => '081234567801',
                'position' => 'DIKTI Coordinator',
                'role_id' => $superAdminRoleId,
                'university_id' => null,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LPPM Administrator',
                'email' => 'lppm@journalmu.org',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=LPPM+Admin&background=0D8ABC&color=fff',
                'phone' => '081234567802',
                'position' => 'LPPM Coordinator',
                'role_id' => $superAdminRoleId,
                'university_id' => null,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Editor Administrator',
                'email' => 'editor@journalmu.org',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Editor+Admin&background=0D8ABC&color=fff',
                'phone' => '081234567803',
                'position' => 'Chief Editor',
                'role_id' => $superAdminRoleId,
                'university_id' => null,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== ADMIN KAMPUS ====================
            [
                'name' => 'Dr. Ahmad Fauzi, M.Kom',
                'email' => 'admin.uad@ajm.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=random',
                'phone' => '081234567891',
                'position' => 'Kepala LPPM',
                'role_id' => $adminKampusRoleId,
                'university_id' => $uadId,
                'is_active' => true,
                'last_login_at' => now()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Siti Nurjanah, M.Si',
                'email' => 'admin.umy@ajm.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Siti+Nurjanah&background=random',
                'phone' => '081234567892',
                'position' => 'Kepala Bagian Penelitian',
                'role_id' => $adminKampusRoleId,
                'university_id' => $umyId,
                'is_active' => true,
                'last_login_at' => now()->subDays(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Prof. Dr. Budi Santoso, M.T',
                'email' => 'admin.ums@ajm.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random',
                'phone' => '081234567893',
                'position' => 'Wakil Rektor Bidang Riset',
                'role_id' => $adminKampusRoleId,
                'university_id' => $umsId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== USER (PENGELOLA JURNAL) ====================
            // UAD Users
            [
                'name' => 'Andi Prasetyo, S.Kom, M.T',
                'email' => 'andi.prasetyo@uad.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Andi+Prasetyo&background=random',
                'phone' => '081234567894',
                'position' => 'Dosen Informatika',
                'role_id' => $userRoleId,
                'university_id' => $uadId,
                'is_active' => true,
                'last_login_at' => now()->subHours(5),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Kartika, S.Pd, M.Pd',
                'email' => 'dewi.kartika@uad.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Dewi+Kartika&background=random',
                'phone' => '081234567895',
                'position' => 'Dosen Pendidikan',
                'role_id' => $userRoleId,
                'university_id' => $uadId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMY Users
            [
                'name' => 'Eko Wijaya, S.E, M.M',
                'email' => 'eko.wijaya@umy.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Eko+Wijaya&background=random',
                'phone' => '081234567896',
                'position' => 'Dosen Manajemen',
                'role_id' => $userRoleId,
                'university_id' => $umyId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fitri Rahmawati, S.Kep, Ns, M.Kep',
                'email' => 'fitri.rahmawati@umy.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Fitri+Rahmawati&background=random',
                'phone' => '081234567897',
                'position' => 'Dosen Keperawatan',
                'role_id' => $userRoleId,
                'university_id' => $umyId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMS Users
            [
                'name' => 'Hendra Gunawan, S.T, M.T',
                'email' => 'hendra.gunawan@ums.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Hendra+Gunawan&background=random',
                'phone' => '081234567898',
                'position' => 'Dosen Teknik Sipil',
                'role_id' => $userRoleId,
                'university_id' => $umsId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMM Users
            [
                'name' => 'Indah Permatasari, S.Psi, M.Psi',
                'email' => 'indah.permatasari@umm.ac.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'google_id' => null,
                'microsoft_id' => null,
                'avatar_url' => 'https://ui-avatars.com/api/?name=Indah+Permatasari&background=random',
                'phone' => '081234567899',
                'position' => 'Dosen Psikologi',
                'role_id' => $userRoleId,
                'university_id' => $ummId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);

        $this->command->info(count($users).' Users created successfully!');

        // Mark some users as reviewers for Pembinaan system
        $this->markReviewers();

        $this->command->info('');
        $this->command->info('📧 Login Credentials:');
        $this->command->info('Super Admin: superadmin@ajm.ac.id / password123');
        $this->command->info('Admin UAD: admin.uad@ajm.ac.id / password123');
        $this->command->info('User UAD: andi.prasetyo@uad.ac.id / password123');
    }

    /**
     * Mark specific users as reviewers for the Pembinaan system.
     * Selects experienced users from different universities to serve as reviewers.
     */
    private function markReviewers(): void
    {
        $reviewerEmails = [
            'andi.prasetyo@uad.ac.id',     // UAD - Senior lecturer (Informatika)
            'eko.wijaya@umy.ac.id',        // UMY - Senior lecturer (Ekonomi)
            'hendra.gunawan@ums.ac.id',    // UMS - Senior lecturer (Teknik)
        ];

        DB::table('users')
            ->whereIn('email', $reviewerEmails)
            ->update(['is_reviewer' => true]);

        $this->command->info('✓ Marked 3 users as reviewers (UAD, UMY, UMS)');
    }
}
