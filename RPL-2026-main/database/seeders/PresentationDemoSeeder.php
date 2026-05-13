<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Presentation Demo Seeder
 *
 * Seeds minimal data for presentation purposes (February 12, 2026 at 1 PM).
 * Creates only essential data: roles, scientific fields, universities, and 3 demo users.
 *
 * Usage:
 * php artisan migrate:fresh
 * php artisan db:seed --class=PresentationDemoSeeder
 */
class PresentationDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Presentation Demo Seeder...');
        $this->command->newLine();

        // 1. Seed base data
        $this->command->info('📋 Seeding base data...');
        $this->call([
            RoleSeeder::class,
            ScientificFieldSeeder::class,
            UniversitySeeder::class,
        ]);
        $this->command->newLine();

        // 2. Create demo users
        $this->command->info('👥 Creating demo users...');
        $this->createDemoUsers();
        $this->command->newLine();

        // Success message
        $this->command->info('✅ Presentation Demo Seeder completed successfully!');
        $this->command->newLine();
        $this->displayLoginCredentials();
    }

    /**
     * Create 3 demo users for presentation: DIKTI, LPPM, and Editor.
     */
    private function createDemoUsers(): void
    {
        // Get role IDs
        $superAdminRoleId = DB::table('roles')
            ->where('name', Role::SUPER_ADMIN)
            ->value('id');
        $adminKampusRoleId = DB::table('roles')
            ->where('name', Role::ADMIN_KAMPUS)
            ->value('id');
        $userRoleId = DB::table('roles')
            ->where('name', Role::USER)
            ->value('id');

        // Get UAD university ID
        $uadId = DB::table('universities')
            ->where('code', 'UAD')
            ->value('id');

        $users = [
            // DIKTI Administrator (Super Admin, no university affiliation)
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
            // LPPM Administrator (Admin Kampus, UAD)
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
                'role_id' => $adminKampusRoleId,
                'university_id' => $uadId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Editor (User, UAD)
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
                'role_id' => $userRoleId,
                'university_id' => $uadId,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);

        $this->command->info('✓ Created 3 demo users: DIKTI (Super Admin), LPPM (Admin Kampus - UAD), Editor (User - UAD)');
    }

    /**
     * Display login credentials for demo users.
     */
    private function displayLoginCredentials(): void
    {
        $this->command->info('📧 Demo Login Credentials:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('DIKTI:  dikti@journalmu.org  / password123');
        $this->command->info('LPPM:   lppm@journalmu.org   / password123');
        $this->command->info('Editor: editor@journalmu.org / password123');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->newLine();
        $this->command->warn('⚠️  IMPORTANT: Change passwords after presentation!');
    }
}
