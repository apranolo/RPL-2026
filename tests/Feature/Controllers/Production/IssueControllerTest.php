<?php

namespace Tests\Feature\Controllers\Production;

use App\Models\Galley;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    /**
     * Test index access.
     */
    public function test_index_allows_authorized_journal_owner()
    {
        $user = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('user.production.issue.index', $journal->id));

        $response->assertStatus(200);
    }

    public function test_index_denies_unauthorized_user()
    {
        $user = User::factory()->user()->create();
        $otherUser = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->get(route('user.production.issue.index', $journal->id));

        $response->assertStatus(403);
    }

    public function test_index_allows_admin_kampus_of_same_university()
    {
        $university = \App\Models\University::factory()->create();
        $adminKampus = User::factory()->adminKampus($university->id)->create();
        $journal = Journal::factory()->create(['university_id' => $university->id]);

        $response = $this->actingAs($adminKampus)->get(route('user.production.issue.index', $journal->id));

        $response->assertStatus(200);
    }

    public function test_index_denies_admin_kampus_of_different_university()
    {
        $university1 = \App\Models\University::factory()->create();
        $university2 = \App\Models\University::factory()->create();
        $adminKampus = User::factory()->adminKampus($university1->id)->create();
        $journal = Journal::factory()->create(['university_id' => $university2->id]);

        $response = $this->actingAs($adminKampus)->get(route('user.production.issue.index', $journal->id));

        $response->assertStatus(403);
    }

    public function test_index_allows_super_admin()
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $journal = Journal::factory()->create();

        $response = $this->actingAs($superAdmin)->get(route('user.production.issue.index', $journal->id));

        $response->assertStatus(200);
    }

    /**
     * Test preview access.
     */
    public function test_preview_allows_authorized_journal_owner()
    {
        $user = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $user->id]);
        $issue = Issue::create([
            'journal_id' => $journal->id,
            'volume' => 1,
            'number' => 2,
            'year' => 2026,
            'title' => 'Test Issue',
            'status' => 'Draft',
        ]);

        $submission = Submission::create([
            'journal_id' => $journal->id,
            'author_id' => $user->id,
            'title' => 'Scientific Manuscript Title',
            'status' => 'unassigned',
        ]);

        $galley = Galley::create([
            'submission_id' => $submission->id,
            'issue_id' => $issue->id,
            'label' => 'PDF',
            'file_path' => 'galleys/file.pdf',
            'page_from' => 15,
            'page_to' => 28,
            'doi' => '10.1234/jurnalmu.v12i2.5678',
            'sequence' => 1,
        ]);

        $response = $this->actingAs($user)->get(route('user.production.issue.preview', [
            'journal' => $journal->id,
            'volume' => 1,
            'issue' => 2,
        ]));

        $response->assertStatus(200);
    }

    public function test_preview_denies_unauthorized_user()
    {
        $user = User::factory()->user()->create();
        $otherUser = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $otherUser->id]);
        $issue = Issue::create([
            'journal_id' => $journal->id,
            'volume' => 1,
            'number' => 2,
            'year' => 2026,
            'title' => 'Test Issue',
            'status' => 'Draft',
        ]);

        $submission = Submission::create([
            'journal_id' => $journal->id,
            'author_id' => $otherUser->id,
            'title' => 'Scientific Manuscript Title',
            'status' => 'unassigned',
        ]);

        $galley = Galley::create([
            'submission_id' => $submission->id,
            'issue_id' => $issue->id,
            'label' => 'PDF',
            'file_path' => 'galleys/file.pdf',
            'page_from' => 15,
            'page_to' => 28,
            'doi' => '10.1234/jurnalmu.v12i2.5678',
            'sequence' => 1,
        ]);

        $response = $this->actingAs($user)->get(route('user.production.issue.preview', [
            'journal' => $journal->id,
            'volume' => 1,
            'issue' => 2,
        ]));

        $response->assertStatus(403);
    }

    /**
     * Test publish access.
     */
    public function test_publish_allows_authorized_journal_owner()
    {
        $user = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $user->id]);
        $issue = Issue::create([
            'journal_id' => $journal->id,
            'volume' => 1,
            'number' => 2,
            'year' => 2026,
            'title' => 'Test Issue',
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($user)->post(route('user.production.issue.publish', [
            'journal' => $journal->id,
            'volume' => 1,
            'issue' => 2,
        ]));

        $response->assertRedirect();
        $response->assertSessionHas('success', "Issue Vol 1 No 2 berhasil dipublish.");
        $this->assertEquals('Published', $issue->fresh()->status);
    }

    public function test_publish_denies_unauthorized_user()
    {
        $user = User::factory()->user()->create();
        $otherUser = User::factory()->user()->create();
        $journal = Journal::factory()->create(['user_id' => $otherUser->id]);
        $issue = Issue::create([
            'journal_id' => $journal->id,
            'volume' => 1,
            'number' => 2,
            'year' => 2026,
            'title' => 'Test Issue',
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($user)->post(route('user.production.issue.publish', [
            'journal' => $journal->id,
            'volume' => 1,
            'issue' => 2,
        ]));

        $response->assertStatus(403);
        $this->assertEquals('Draft', $issue->fresh()->status);
    }
}
