<?php

namespace Tests\Feature;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Menguji pengguna terautentikasi dapat mengakses halaman edit proposal.
     */
    public function test_authenticated_user_can_access_edit_proposal_page()
    {
        /** @var \Illuminate\Contracts\Auth\Authenticatable $user */
        $user = User::factory()->create();
        $proposal = Proposal::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('proposal.edit', $proposal));

        $response->assertStatus(200);
    }

    /**
     * Menguji pemilik dapat memperbarui proposal mereka sendiri.
     */
    public function test_user_can_update_their_own_proposal()
    {
        /** @var \Illuminate\Contracts\Auth\Authenticatable $user */
        $user = User::factory()->create();
        $proposal = Proposal::factory()->create(['user_id' => $user->id]);

        $updatedData = [
            'judul' => 'Judul Baru Diubah',
            'deskripsi' => 'Deskripsi Baru Diubah',
        ];

        $response = $this->actingAs($user)->put(route('proposal.update', $proposal), $updatedData);

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'judul' => 'Judul Baru Diubah',
        ]);
    }

    /**
     * Menguji pengguna lain tidak dapat memperbarui proposal milik orang lain.
     */
    public function test_user_cannot_update_others_proposal()
    {
        $user1 = User::factory()->create();
        /** @var \Illuminate\Contracts\Auth\Authenticatable $user2 */
        $user2 = User::factory()->create();
        $proposal = Proposal::factory()->create(['user_id' => $user1->id]);

        $updatedData = [
            'judul' => 'Mencoba Mengubah',
            'deskripsi' => 'Mencoba Mengubah Deskripsi',
        ];

        $response = $this->actingAs($user2)->put(route('proposal.update', $proposal), $updatedData);

        $response->assertStatus(403);
    }

    /**
     * Menguji pemilik dapat menghapus proposal mereka sendiri.
     */
    public function test_user_can_delete_their_own_proposal()
    {
        /** @var \Illuminate\Contracts\Auth\Authenticatable $user */
        $user = User::factory()->create();
        $proposal = Proposal::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('proposal.destroy', $proposal));

        $this->assertDatabaseMissing('proposals', [
            'id' => $proposal->id,
        ]);
    }

    /**
     * Menguji pengguna lain tidak dapat menghapus proposal milik orang lain.
     */
    public function test_user_cannot_delete_others_proposal()
    {
        $user1 = User::factory()->create();
        /** @var \Illuminate\Contracts\Auth\Authenticatable $user2 */
        $user2 = User::factory()->create();
        $proposal = Proposal::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2)->delete(route('proposal.destroy', $proposal));

        $response->assertStatus(403);
        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
        ]);
    }
}
