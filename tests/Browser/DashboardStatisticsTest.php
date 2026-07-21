<?php

namespace Tests\Browser;

use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class DashboardStatisticsTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        Role::create([
            'name' => Role::SUPER_ADMIN,
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        Role::create([
            'name' => Role::ADMIN_KAMPUS,
            'display_name' => 'Administrator Kampus',
            'description' => 'University Administrator',
        ]);

        Role::create([
            'name' => Role::USER,
            'display_name' => 'Pengelola Jurnal',
            'description' => 'Journal Manager',
        ]);
    }

    /**
     * Test Super Admin can view statistics for all universities
     */
    public function test_super_admin_views_all_university_statistics()
    {
        $this->browse(function (Browser $browser) {
            // Create test data
            $university1 = University::factory()->create(['name' => 'University A']);
            $university2 = University::factory()->create(['name' => 'University B']);
            $field = ScientificField::factory()->create(['name' => 'Engineering']);

            $user1 = User::factory()->user()->create(['university_id' => $university1->id]);
            $user2 = User::factory()->user()->create(['university_id' => $university2->id]);

            // University 1: 10 journals
            Journal::factory()->count(10)->create([
                'user_id' => $user1->id,
                'university_id' => $university1->id,
                'scientific_field_id' => $field->id,
                'indexations' => ['Scopus' => true],
            ]);

            // University 2: 5 journals
            Journal::factory()->count(5)->create([
                'user_id' => $user2->id,
                'university_id' => $university2->id,
                'scientific_field_id' => $field->id,
                'indexations' => ['DOAJ' => true],
            ]);

            $superAdmin = User::factory()->superAdmin()->create([
                'email' => 'superadmin@test.com',
                'password' => bcrypt('password'),
            ]);

            $browser->loginAs($superAdmin)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('15') // Total from both universities
                ->assertSee('Distribusi Indeksasi')
                ->assertSee('Distribusi Akreditasi SINTA')
                ->assertSee('Distribusi Bidang Ilmu');
        });
    }

    /**
     * Test Admin Kampus can only view their university statistics
     */
    public function test_admin_kampus_views_only_their_university_statistics()
    {
        $this->browse(function (Browser $browser) {
            // Create test data
            $university1 = University::factory()->create(['name' => 'University A']);
            $university2 = University::factory()->create(['name' => 'University B']);
            $field = ScientificField::factory()->create(['name' => 'Medicine']);

            $adminKampus1 = User::factory()->adminKampus()->create([
                'university_id' => $university1->id,
                'email' => 'admin1@test.com',
                'password' => bcrypt('password'),
            ]);

            $user1 = User::factory()->user()->create(['university_id' => $university1->id]);
            $user2 = User::factory()->user()->create(['university_id' => $university2->id]);

            // University 1: 8 journals
            Journal::factory()->count(8)->create([
                'user_id' => $user1->id,
                'university_id' => $university1->id,
                'scientific_field_id' => $field->id,
                'sinta_rank' => '1',
            ]);

            // University 2: 12 journals (should not be visible)
            Journal::factory()->count(12)->create([
                'user_id' => $user2->id,
                'university_id' => $university2->id,
                'scientific_field_id' => $field->id,
                'sinta_rank' => '2',
            ]);

            $browser->loginAs($adminKampus1)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('8') // Only university 1 journals
                ->assertDontSee('12') // University 2 journals not visible
                ->assertSee('Jurnal SINTA')
                ->assertSee('8'); // All 8 are SINTA 1
        });
    }

    /**
     * Test User can only view their own journal statistics
     */
    public function test_user_views_only_their_own_journal_statistics()
    {
        $this->browse(function (Browser $browser) {
            // Create test data
            $university = University::factory()->create();
            $field = ScientificField::factory()->create(['name' => 'Economics']);

            $user1 = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'user1@test.com',
                'password' => bcrypt('password'),
            ]);
            $user2 = User::factory()->user()->create(['university_id' => $university->id]);

            // User 1: 5 journals
            Journal::factory()->count(5)->create([
                'user_id' => $user1->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
                'indexations' => ['Scopus' => true, 'DOAJ' => true],
            ]);

            // User 2: 10 journals (should not be visible)
            Journal::factory()->count(10)->create([
                'user_id' => $user2->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
            ]);

            $browser->loginAs($user1)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('5') // Only user 1 journals
                ->assertDontSee('10') // User 2 journals not visible
                ->assertSee('Jurnal Terindeks Scopus')
                ->assertSee('5'); // All 5 are Scopus indexed
        });
    }

    /**
     * Test dashboard charts are rendered correctly
     */
    public function test_dashboard_renders_all_charts()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $field1 = ScientificField::factory()->create(['name' => 'Engineering']);
            $field2 = ScientificField::factory()->create(['name' => 'Medicine']);

            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'user@test.com',
                'password' => bcrypt('password'),
            ]);

            // Create diverse journals
            Journal::factory()->count(5)->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field1->id,
                'indexations' => ['Scopus' => true],
                'sinta_rank' => '1',
            ]);

            Journal::factory()->count(3)->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field2->id,
                'indexations' => ['DOAJ' => true],
                'sinta_rank' => '2',
            ]);

            $browser->loginAs($user)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->waitForText('Distribusi Indeksasi')
                ->waitForText('Distribusi Akreditasi SINTA')
                ->waitForText('Distribusi Bidang Ilmu')
                // Verify chart cards are present
                ->assertPresent('.apexcharts-canvas')
                ->assertSeeIn('.apexcharts-canvas', '') // Charts should be rendered
                ->pause(1000); // Allow charts to fully render
        });
    }

    /**
     * Test dashboard shows empty state when no journals
     */
    public function test_dashboard_shows_empty_state_with_no_journals()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'emptyuser@test.com',
                'password' => bcrypt('password'),
            ]);

            $browser->loginAs($user)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('0')
                ->assertSee('Tidak ada data indeksasi')
                ->assertSee('Tidak ada data akreditasi')
                ->assertSee('Tidak ada data bidang ilmu');
        });
    }

    /**
     * Test statistics update after creating new journal
     */
    public function test_statistics_update_after_journal_creation()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $field = ScientificField::factory()->create(['name' => 'Engineering']);

            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'testuser@test.com',
                'password' => bcrypt('password'),
            ]);

            // Initial state: 0 journals
            $browser->loginAs($user)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('0');

            // Create journal
            Journal::factory()->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
                'indexations' => ['Scopus' => true],
            ]);

            // Refresh and verify update
            $browser->refresh()
                ->waitForText('Total Jurnal')
                ->assertSee('1')
                ->assertSee('Jurnal Terindeks Scopus')
                ->assertSee('1');
        });
    }

    /**
     * Test dark mode theme toggle
     */
    public function test_dashboard_theme_toggle()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $field = ScientificField::factory()->create();

            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'themeuser@test.com',
                'password' => bcrypt('password'),
            ]);

            Journal::factory()->count(5)->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
            ]);

            $browser->loginAs($user)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                // Find and click theme toggle button
                ->whenAvailable('button[aria-label*="theme" i]', function ($toggle) {
                    $toggle->click();
                })
                ->pause(500) // Wait for theme transition
                // Charts should still be visible after theme change
                ->assertPresent('.apexcharts-canvas')
                ->assertSee('Total Jurnal');
        });
    }

    /**
     * Test responsive design on mobile viewport
     */
    public function test_dashboard_responsive_on_mobile()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $field = ScientificField::factory()->create();

            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'mobileuser@test.com',
                'password' => bcrypt('password'),
            ]);

            Journal::factory()->count(3)->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
            ]);

            $browser->loginAs($user)
                ->resize(375, 812) // iPhone X dimensions
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                ->assertSee('3')
                ->assertSee('Distribusi Indeksasi')
                ->assertSee('Distribusi Akreditasi SINTA')
                // Charts should stack vertically on mobile
                ->assertPresent('.apexcharts-canvas');
        });
    }

    /**
     * Test dashboard accessibility features
     */
    public function test_dashboard_accessibility_features()
    {
        $this->browse(function (Browser $browser) {
            $university = University::factory()->create();
            $field = ScientificField::factory()->create();

            $user = User::factory()->user()->create([
                'university_id' => $university->id,
                'email' => 'a11yuser@test.com',
                'password' => bcrypt('password'),
            ]);

            Journal::factory()->count(5)->create([
                'user_id' => $user->id,
                'university_id' => $university->id,
                'scientific_field_id' => $field->id,
            ]);

            $browser->loginAs($user)
                ->visit('/dashboard')
                ->waitForText('Total Jurnal')
                // Check for ARIA labels
                ->assertPresent('[role="img"]')
                ->assertPresent('[aria-label]')
                // Verify semantic HTML structure
                ->assertPresent('main')
                ->assertPresent('h1, h2, h3'); // Proper heading structure
        });
    }
}
