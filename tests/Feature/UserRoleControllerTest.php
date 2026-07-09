<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_user_roles_index()
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->superAdmin()->create([
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get(route('admin.users.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users')
            ->where('users.0.name', $user->name)
        );
    }

    public function test_admin_can_revoke_user_role()
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->superAdmin()->create([
            'is_active' => true,
        ]);

        $targetUser = User::factory()->create();
        $journal = \App\Models\Journal::factory()->create();

        $userRole = \App\Models\UserRole::create([
            'user_id' => $targetUser->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $this->assertDatabaseHas('user_roles', [
            'id' => $userRole->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.users.revoke', $userRole->id));

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success', 'Hak akses peran berhasil dicabut.');

        $this->assertDatabaseMissing('user_roles', [
            'id' => $userRole->id,
        ]);
    }
}

