<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Migrate existing users with role_id to user_roles pivot table
     */
    public function up(): void
    {
        // Get all users with a role_id
        $users = DB::table('users')
            ->whereNotNull('role_id')
            ->select('id', 'role_id')
            ->get();

        foreach ($users as $user) {
            // Insert into user_roles pivot table
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $user->role_id,
                'assigned_at' => now(),
                'assigned_by' => null, // System migration
            ]);
        }

        // Also migrate is_reviewer flag to Reviewer role
        $reviewers = DB::table('users')
            ->where('is_reviewer', true)
            ->select('id')
            ->get();

        $reviewerRole = DB::table('roles')->where('name', 'Reviewer')->first();

        if ($reviewerRole) {
            foreach ($reviewers as $reviewer) {
                // Check if already exists to avoid duplicate
                $exists = DB::table('user_roles')
                    ->where('user_id', $reviewer->id)
                    ->where('role_id', $reviewerRole->id)
                    ->exists();

                if (! $exists) {
                    DB::table('user_roles')->insert([
                        'user_id' => $reviewer->id,
                        'role_id' => $reviewerRole->id,
                        'assigned_at' => now(),
                        'assigned_by' => null, // System migration
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear all user_roles entries (this is destructive!)
        DB::table('user_roles')->truncate();
    }
};
