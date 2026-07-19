<?php

use App\Models\User;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can fetch notifications list and unread count', function () {
    $user = User::factory()->create();

    // Create database notifications for user
    $user->notify(new class extends \Illuminate\Notifications\Notification {
        public function via($notifiable) { return ['database']; }
        public function toArray($notifiable) {
            return [
                'title' => 'Test Notification 1',
                'message' => 'This is a test notification 1',
                'url' => '/dashboard',
            ];
        }
    });

    $response = $this->actingAs($user)->getJson(route('notifications.index'));

    $response->assertOk()
        ->assertJsonStructure(['notifications', 'unreadCount'])
        ->assertJsonFragment(['unreadCount' => 1]);

    $data = $response->json();
    expect($data['notifications'])->toHaveCount(1)
        ->and($data['notifications'][0]['title'])->toBe('Test Notification 1')
        ->and($data['notifications'][0]['message'])->toBe('This is a test notification 1')
        ->and($data['notifications'][0]['url'])->toBe('/dashboard')
        ->and($data['notifications'][0]['id_user'])->toBe($user->id);
});

test('user can mark a single notification as read', function () {
    $user = User::factory()->create();
    $user->notify(new class extends \Illuminate\Notifications\Notification {
        public function via($notifiable) { return ['database']; }
        public function toArray($notifiable) {
            return [
                'title' => 'Mark Read Test',
                'message' => 'Notification test message',
            ];
        }
    });

    $notification = $user->unreadNotifications->first();

    $response = $this->actingAs($user)->postJson(route('notifications.read', $notification->id));

    $response->assertOk()->assertJson(['success' => true]);

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create();
    $user->notify(new class extends \Illuminate\Notifications\Notification {
        public function via($notifiable) { return ['database']; }
        public function toArray($notifiable) {
            return [
                'title' => 'Notif 1',
                'message' => 'Message 1',
            ];
        }
    });
    $user->notify(new class extends \Illuminate\Notifications\Notification {
        public function via($notifiable) { return ['database']; }
        public function toArray($notifiable) {
            return [
                'title' => 'Notif 2',
                'message' => 'Message 2',
            ];
        }
    });

    expect($user->unreadNotifications->count())->toBe(2);

    $response = $this->actingAs($user)->postJson(route('notifications.read-all'));

    $response->assertOk()->assertJson(['success' => true]);

    expect($user->fresh()->unreadNotifications->count())->toBe(0);
});

test('activity log model correctly maps database fields to spec accessors', function () {
    $user = User::factory()->create(['name' => 'Aktor Ryan']);
    
    $log = ActivityLog::create([
        'submission_id' => 12,
        'user_id' => $user->id,
        'action' => 'File Uploaded',
        'description' => 'User uploaded revision file.',
    ]);

    expect($log->id_submission)->toBe(12)
        ->and($log->id_user)->toBe($user->id)
        ->and($log->user_name)->toBe('Aktor Ryan')
        ->and($log->action_type)->toBe('File Uploaded')
        ->and($log->activity_description)->toBe('User uploaded revision file.')
        ->and($log->toArray())->toHaveKeys(['id_submission', 'id_user', 'user_name', 'action_type', 'activity_description']);
});
