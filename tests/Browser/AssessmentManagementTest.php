<?php

namespace Tests\Browser;

use App\Models\EvaluationIndicator;
use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class AssessmentManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected $user;

    protected $journal;

    protected function setUp(): void
    {
        parent::setUp();

        Browser::macro('captureResponse', function () {
            // Helper to capture content if needed for debug
            file_put_contents('debug.html', $this->driver->getPageSource());

            return $this;
        });

        // Seed required data (same pattern as other test classes)
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'UniversitySeeder']);
        $this->artisan('db:seed', ['--class' => 'ScientificFieldSeeder']);

        $role = Role::where('name', 'User')->first();
        $university = University::first();

        $this->user = User::create([
            'name' => 'Test Assessment User',
            'email' => 'test.assessment@uad.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
            'university_id' => $university->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->journal = Journal::create([
            'user_id' => $this->user->id,
            'university_id' => $university->id,
            'title' => 'My Journal',
            'issn' => '1234-5678',
            'is_active' => true,
        ]);
    }

    public function test_user_can_create_assessment()
    {
        EvaluationIndicator::create([
            'category' => 'Kelengkapan',
            'code' => 'K01',
            'question' => 'Apakah jurnal memiliki ISSN?',
            'weight' => 1.0,
            'answer_type' => 'boolean',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/assessments/create')
                ->captureResponse()
                ->waitForText('Buat Assessment Baru', 25)
                ->pause(2000) // Pause for React hydration
                ->assertSee('Buat Assessment Baru')
                ->waitFor('button[role="combobox"]', 25)
                ->click('button[role="combobox"]')
                ->waitForText($this->journal->title, 25)
                ->click("div[role='option']:first-child")
                ->type('assessment_date', '2025-01-01')
                ->click("label[for='1-yes']")
                ->press('Simpan Draft')
                ->pause(5000)
                ->assertSee('My Journal')
                ->assertSee('Draft');
        });
    }

    public function test_user_can_upload_attachment()
    {
        EvaluationIndicator::create([
            'category' => 'Bukti',
            'code' => 'B01',
            'question' => 'Upload SK?',
            'weight' => 1.0,
            'answer_type' => 'boolean',
            'requires_attachment' => true,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/assessments/create')
                ->waitForText('Buat Assessment Baru', 25)
                ->pause(2000) // Pause for React hydration
                ->waitFor('button[role="combobox"]', 25)
                ->click('button[role="combobox"]')
                ->waitForText($this->journal->title, 25)
                ->click("div[role='option']:first-child")
                ->click("label[for='1-yes']")
                ->attach('input[type="file"]', __DIR__.'/testfiles/test.pdf')
                ->press('Simpan Draft')
                ->pause(5000)
                ->assertSee('test.pdf');
        });
    }
}
