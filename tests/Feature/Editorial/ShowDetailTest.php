<?php

test('halaman detail submission dapat diakses oleh editor', function () {
    $user = User::factory()->create(['role' => 'Editor']);
    $submission = Submission::factory()->create();

    $this->actingAs($user)
         ->get('/editorial/desk/' . $submission->id)
         ->assertStatus(200);
});
