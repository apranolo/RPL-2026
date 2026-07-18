<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_author_profile_page(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertStatus(200);
    }

    public function test_user_can_update_author_profile(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile', [
                'orcid' => '0000-1234-5678',
                'affiliation' => 'Universitas Ahmad Dahlan',
                'bio' => 'Peneliti bidang teknologi informasi.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('author_profiles', [
            'user_id' => $user->id,
            'orcid' => '0000-1234-5678',
        ]);
    }
}
