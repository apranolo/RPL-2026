<?php

namespace Tests\Feature\Notification;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;
    private User $adminKampus;
    private User $regularUser;
    private User $reviewer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $superAdminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $adminKampusRole = Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        $userRole = Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'User']);
        $reviewerRole = Role::firstOrCreate(['name' => Role::REVIEWER], ['display_name' => 'Reviewer']);

        // Create users and attach roles
        $this->superAdmin = User::factory()->create(['is_active' => true]);
        $this->superAdmin->roles()->attach($superAdminRole);
        $this->superAdmin->update(['role_id' => $superAdminRole->id]);

        $this->adminKampus = User::factory()->create(['is_active' => true]);
        $this->adminKampus->roles()->attach($adminKampusRole);
        $this->adminKampus->update(['role_id' => $adminKampusRole->id]);

        $this->regularUser = User::factory()->create(['is_active' => true]);
        $this->regularUser->roles()->attach($userRole);
        $this->regularUser->update(['role_id' => $userRole->id]);

        $this->reviewer = User::factory()->create(['is_active' => true]);
        $this->reviewer->roles()->attach($reviewerRole);
        $this->reviewer->update(['role_id' => $reviewerRole->id]);
    }

    /**
     * Test guest cannot send notifications.
     */
    public function test_guest_cannot_notify_reviewer(): void
    {
        $response = $this->postJson(route('notifications.notify-reviewer'), [
            'reviewer_id' => $this->reviewer->id,
            'title' => 'Test Notification',
            'message' => 'This is a test notification message.',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test regular user cannot send notifications.
     */
    public function test_regular_user_cannot_notify_reviewer(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson(route('notifications.notify-reviewer'), [
                'reviewer_id' => $this->reviewer->id,
                'title' => 'Test Notification',
                'message' => 'This is a test notification message.',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test super admin can send notifications.
     */
    public function test_super_admin_can_notify_reviewer(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson(route('notifications.notify-reviewer'), [
                'reviewer_id' => $this->reviewer->id,
                'title' => 'Tugas Review Baru',
                'message' => 'Anda telah ditugaskan untuk mereview jurnal.',
                'action_url' => '/reviewer/dashboard',
                'type' => 'reviewer_assignment',
                'source_id' => 1,
                'source_type' => 'ReviewerAssignment',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Notification sent successfully to reviewer.',
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $this->reviewer->id,
            'notifiable_type' => User::class,
        ]);
    }

    /**
     * Test admin kampus can send notifications.
     */
    public function test_admin_kampus_can_notify_reviewer(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->postJson(route('notifications.notify-reviewer'), [
                'reviewer_id' => $this->reviewer->id,
                'title' => 'Tugas Review Baru',
                'message' => 'Anda telah ditugaskan untuk mereview jurnal.',
            ]);

        $response->assertStatus(200);
    }

    /**
     * Test validation fails if user is not a reviewer.
     */
    public function test_cannot_notify_user_who_is_not_a_reviewer(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson(route('notifications.notify-reviewer'), [
                'reviewer_id' => $this->regularUser->id,
                'title' => 'Test',
                'message' => 'Test message',
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'The selected user is not a reviewer.',
        ]);
    }
}
