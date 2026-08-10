<?php

use App\Models\SystemLog;
use App\Models\University;
use App\Models\User;

test('system log appends actor_name correctly matching user name', function () {
    $university = University::factory()->create();
    $user = User::factory()->create([
        'university_id' => $university->id,
        'name' => 'John Doe',
    ]);

    $log = SystemLog::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'action' => 'login',
        'description' => 'User logged in',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Testing/1.0',
    ]);

    expect($log->actor_name)->toBe('John Doe');
    expect($log->toArray())->toHaveKey('actor_name');
    expect($log->toArray()['actor_name'])->toBe('John Doe');
});

test('system log actor_name defaults to System when no user_id is present', function () {
    $university = University::factory()->create();

    $log = SystemLog::create([
        'university_id' => $university->id,
        'user_id' => null,
        'action' => 'cron_job',
        'description' => 'System scheduled task executed',
    ]);

    expect($log->actor_name)->toBe('System');
    expect($log->toArray()['actor_name'])->toBe('System');
});

test('system log correctly sets university_id and belongsTo relations', function () {
    $university = University::factory()->create(['name' => 'Universitas Indonesia']);
    $user = User::factory()->create(['university_id' => $university->id]);

    $log = SystemLog::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'action' => 'create_article',
        'description' => 'Created new article',
    ]);

    expect($log->university_id)->toBe($university->id);
    expect($log->university)->toBeInstanceOf(University::class);
    expect($log->university->name)->toBe('Universitas Indonesia');

    expect($log->user_id)->toBe($user->id);
    expect($log->user)->toBeInstanceOf(User::class);
    expect($log->user->id)->toBe($user->id);
});

test('user hasMany systemLogs relation works', function () {
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $log1 = SystemLog::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'action' => 'action_1',
        'description' => 'First action',
    ]);

    $log2 = SystemLog::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'action' => 'action_2',
        'description' => 'Second action',
    ]);

    expect($user->systemLogs)->toHaveCount(2);
    expect($user->systemLogs->pluck('id')->all())->toContain($log1->id, $log2->id);
});
