<?php

namespace Tests\Feature\Production;

use App\Models\Galley;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleyControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an editor or admin user
        $this->user = User::factory()->create();
        $this->user->assignRole('Editor');
    }

    public function test_can_update_galley_meta_successfully()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create(['id_journal' => $journal->id]);
        $galley = Galley::factory()->create(['id_issue' => $issue->id, 'page_from' => null, 'page_to' => null, 'doi' => null]);

        $response = $this->actingAs($this->user)->patch(route('production.galley.updateMeta', $galley->id), [
            'page_from' => 10,
            'page_to' => 25,
            'doi' => '10.1234/test.123'
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Metadata artikel berhasil diperbarui.');

        $this->assertDatabaseHas('galleys', [
            'id' => $galley->id,
            'page_from' => 10,
            'page_to' => 25,
            'doi' => '10.1234/test.123',
        ]);
    }

    public function test_cannot_update_galley_with_invalid_pages()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create(['id_journal' => $journal->id]);
        $galley = Galley::factory()->create(['id_issue' => $issue->id]);

        $response = $this->actingAs($this->user)->patch(route('production.galley.updateMeta', $galley->id), [
            'page_from' => 30,
            'page_to' => 20, // page_to is less than page_from
        ]);

        $response->assertSessionHasErrors(['page_to']);
    }

    public function test_can_render_set_meta_page()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create(['id_journal' => $journal->id]);
        $galley = Galley::factory()->create(['id_issue' => $issue->id]);

        $response = $this->actingAs($this->user)->get(route('production.galley.setMeta', $galley->id));

        $response->assertStatus(200);
    }
}
