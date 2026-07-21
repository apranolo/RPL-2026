<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $this->seedRoles();
    $university = \App\Models\University::factory()->create();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'university_id' => $university->id,
        'role_type' => 'user',
    ]);

    $this->assertGuest();
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'approval_status' => 'pending',
        'is_active' => false,
    ]);
    $response->assertRedirect(route('login'));
});
