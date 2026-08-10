<?php

namespace Tests\Unit;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationAndActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_log_appends_and_relations(): void
    {
        $role = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $user = User::create([
            'name' => 'Ryan Ananda',
            'email' => 'ryan@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $log = ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'created_discussion',
            'description' => 'User started a discussion.',
        ]);

        $this->assertEquals($user->id, $log->id_user);
        $this->assertEquals('Ryan Ananda', $log->user_name);
        $this->assertEquals('created_discussion', $log->action_type);
        $this->assertEquals('User started a discussion.', $log->activity_description);
        $this->assertEquals($user->id, $log->user->id);
        $this->assertTrue($user->activityLogs->contains($log));
        $this->assertArrayHasKey('user_name', $log->toArray());
    }

    public function test_notification_appends_and_accessors(): void
    {
        $role = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $notification = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\DiscussionNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => 'Pesan Baru',
                'message' => 'Anda menerima pesan baru.',
                'url' => '/dashboard',
            ],
        ]);

        $this->assertEquals($user->id, $notification->id_user);
        $this->assertEquals('Pesan Baru', $notification->title);
        $this->assertEquals('Anda menerima pesan baru.', $notification->message);
        $this->assertEquals('/dashboard', $notification->url);
        $this->assertArrayHasKey('title', $notification->toArray());
    }
}
