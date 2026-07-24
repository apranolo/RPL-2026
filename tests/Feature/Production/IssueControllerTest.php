<?php

namespace Tests\Feature\Production;

use App\Models\Galley;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueControllerTest extends TestCase
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

    public function test_can_delete_draft_issue_without_galleys()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create([
            'id_journal' => $journal->id,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($this->user)->delete(route('production.issue.destroy', $issue->id));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Issue berhasil dihapus.');

        $this->assertDatabaseMissing('issues', [
            'id' => $issue->id,
        ]);
    }

    public function test_cannot_delete_published_issue()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create([
            'id_journal' => $journal->id,
            'status' => 'Published',
        ]);

        $response = $this->actingAs($this->user)->delete(route('production.issue.destroy', $issue->id));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Hanya Issue berstatus Draft yang dapat dihapus.');

        $this->assertDatabaseHas('issues', [
            'id' => $issue->id,
        ]);
    }

    public function test_cannot_delete_draft_issue_with_galleys()
    {
        $journal = Journal::factory()->create();
        $issue = Issue::factory()->create([
            'id_journal' => $journal->id,
            'status' => 'Draft',
        ]);

        Galley::factory()->create([
            'id_issue' => $issue->id,
        ]);

        $response = $this->actingAs($this->user)->delete(route('production.issue.destroy', $issue->id));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Issue tidak dapat dihapus karena sudah memiliki artikel.');

        $this->assertDatabaseHas('issues', [
            'id' => $issue->id,
        ]);
    }
}
