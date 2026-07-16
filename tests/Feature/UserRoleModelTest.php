<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_have_journal_specific_roles()
    {
        $user = User::factory()->create();
        $journal = Journal::factory()->create();

        $userRole = UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $this->assertTrue($user->hasJournalRole('Editor', $journal->id));
        $this->assertTrue($user->hasRoleInAnyJournal('Editor'));
        $this->assertFalse($user->hasJournalRole('Author', $journal->id));
        $this->assertEquals($user->id, $userRole->id_user);
    }
}
