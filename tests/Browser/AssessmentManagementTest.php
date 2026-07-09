<?php

namespace Tests\Browser;

use App\Models\EvaluationIndicator;
use App\Models\Journal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class AssessmentManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        Browser::macro('captureResponse', function () {
            // Helper to capture content if needed for debug
            file_put_contents('debug.html', $this->driver->getPageSource());

            return $this;
        });
    }

    public function test_user_can_create_assessment()
    {
        $role = Role::create(['name' => 'User', 'display_name' => 'User']);
        $university = \App\Models\University::factory()->create();
        $user = User::factory()->create([
            'name' => 'Test User',
            'role_id' => $role->id,
            'university_id' => $university->id,
        ]);
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
            'title' => 'My Journal',
            'is_active' => true,
        ]);

        // Seed indicators
        EvaluationIndicator::create([
            'category' => 'Kelengkapan',
            'code' => 'K01',
            'question' => 'Apakah jurnal memiliki ISSN?',
            'weight' => 1.0,
            'answer_type' => 'boolean',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($user, $journal) {
            $browser->loginAs($user)
                ->visit('/user/assessments/create')
                ->captureResponse()
                ->waitForText('Buat Assessment Baru', 10)
                ->assertSee('Buat Assessment Baru')
                // Shadcn UI Select is not a standard select element.
                // We need to trigger it.
                ->waitFor('button[role="combobox"]', 10)
                ->click('button[role="combobox"]') // SelectTrigger is usually a button
                ->waitForText($journal->title, 10)
                ->click("div[role='option']:first-child") // Or find by text
                ->type('assessment_date', '2025-01-01')
                // Click the label for the radio button
                ->click("label[for='1-yes']")
                ->press('Simpan Draft')
                ->waitForRoute('user.assessments.show', ['assessment' => 1])
                ->assertSee('My Journal')
                ->assertSee('Draft');
        });
    }

    public function test_user_can_upload_attachment()
    {
        $role = Role::firstOrCreate(['name' => 'User'], ['display_name' => 'User']);
        $university = \App\Models\University::factory()->create();
        $user = User::factory()->create([
            'role_id' => $role->id,
            'university_id' => $university->id,
        ]);
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        EvaluationIndicator::create([
            'category' => 'Bukti',
            'code' => 'B01',
            'question' => 'Upload SK?',
            'weight' => 1.0,
            'answer_type' => 'boolean',
            'requires_attachment' => true,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($user, $journal) {
            $browser->loginAs($user)
                ->visit('/user/assessments/create')
                ->waitForText('Buat Assessment Baru', 10)
                ->waitFor('button[role="combobox"]', 10)
                ->click('button[role="combobox"]')
                ->waitForText($journal->title)
                ->click("div[role='option']:first-child")
                ->click("label[for='1-yes']")
                // File upload input inside renderFileUpload
                ->attach('input[type="file"]', __DIR__.'/testfiles/test.pdf')
                ->press('Simpan Draft')
                ->waitForRoute('user.assessments.show', ['assessment' => 1])
                ->assertSee('test.pdf');
        });
    }
}
