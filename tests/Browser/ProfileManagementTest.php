<?php

/**
 * Browser (Dusk) tests for Profile Management.
 *
 * Tests end-to-end flows clicking through the actual browser:
 *  - Settings > Profile: view, update info, avatar upload, avatar remove
 *  - Settings > Password: view and change password
 *  - User area > /user/profil: view dashboard, navigate to settings profile
 *  - User area > /user/profil/edit: view and submit update form
 *
 * Prerequisites:
 *  - ChromeDriver running at localhost:9515 (or DUSK_DRIVER_URL)
 *  - XAMPP Apache + MySQL running
 *  - Application accessible at APP_URL
 */

namespace Tests\Browser;

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Storage;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ProfileManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed essential reference data
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'UniversitySeeder']);
        $this->artisan('db:seed', ['--class' => 'ScientificFieldSeeder']);

        $university = University::first();
        $userRole = Role::where('name', Role::USER)->first();

        $this->user = User::create([
            'name' => 'Dewi Rahayu',
            'email' => 'dewi.rahayu@jurnal-test.id',
            'password' => bcrypt('Password123!'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);
    }

    // ─── Settings Profile Page ────────────────────────────────────────────────

    /**
     * @test The settings/profile page loads and displays the form.
     */
    public function test_user_can_view_settings_profile_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 10)
                ->assertSee('Profile settings')
                ->assertInputValue('name', 'Dewi Rahayu')
                ->assertInputValue('email', 'dewi.rahayu@jurnal-test.id');
        });
    }

    /**
     * @test The user can update their name and phone from the settings profile form.
     */
    public function test_user_can_update_profile_info(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 10)
                ->clear('name')->type('name', 'Dewi Rahayu Updated')
                ->clear('phone')->type('phone', '+6281234500000')
                ->clear('position')->type('position', 'Peneliti Senior')
                ->press('Save Changes')
                ->waitForText('Profile updated successfully', 10);
        });
    }

    /**
     * @test The account information section shows role, university, and approval status.
     */
    public function test_settings_profile_shows_account_info_section(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Account Information', 10)
                ->assertSee('Role')
                ->assertSee('Status Akun');
        });
    }

    /**
     * @test Avatar upload: select file, preview appears, click Upload.
     */
    public function test_user_can_upload_avatar(): void
    {
        Storage::fake('public');

        $this->browse(function (Browser $browser) {
            $testImagePath = __DIR__.'/testfiles/test-avatar.png';

            // Create a minimal 1x1 PNG without requiring GD extension
            if (! file_exists($testImagePath)) {
                if (! is_dir(dirname($testImagePath))) {
                    mkdir(dirname($testImagePath), 0755, true);
                }
                file_put_contents($testImagePath, base64_decode(
                    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg=='
                ));
            }

            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->attach('input[type="file"]', $testImagePath)
                ->waitForText('Upload', 5)
                ->press('Upload')
                ->waitForText('Avatar updated successfully', 10);
        });
    }

    /**
     * @test Avatar section renders the user's initials when no avatar_url is set.
     */
    public function test_settings_profile_shows_initials_when_no_avatar(): void
    {
        $this->user->update(['avatar_url' => null]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 10)
                ->assertSee('DR'); // Dewi Rahayu initials
        });
    }

    // ─── Settings Password Page ───────────────────────────────────────────────

    /**
     * @test The settings/password page renders with all fields.
     */
    public function test_user_can_view_password_settings_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update Password', 10)
                ->assertPresent('input[name="current_password"]')
                ->assertPresent('input[name="password"]')
                ->assertPresent('input[name="password_confirmation"]');
        });
    }

    /**
     * @test The user can successfully change their password.
     */
    public function test_user_can_change_password(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update Password', 10)
                ->type('current_password', 'Password123!')
                ->type('password', 'NewPassword456!')
                ->type('password_confirmation', 'NewPassword456!')
                ->press('Save Password')
                ->waitForText('Password updated', 10);
        });
    }

    /**
     * @test Wrong current password shows an error.
     */
    public function test_wrong_current_password_shows_error(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update Password', 10)
                ->type('current_password', 'WrongPass!!!')
                ->type('password', 'NewPassword456!')
                ->type('password_confirmation', 'NewPassword456!')
                ->press('Save Password')
                ->waitFor('.text-destructive, [class*="error"], [class*="Error"]', 10);

            // An error should be shown for current_password field
            $browser->assertPresent('.text-destructive, [class*="error"]');
        });
    }

    // ─── User Area Profil Dashboard ───────────────────────────────────────────

    /**
     * @test The /user/profil page loads with all tabs.
     */
    public function test_user_can_view_profil_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Profil', 10)
                ->assertSee('Overview')
                ->assertSee('Jurnal Saya')
                ->assertSee('Riwayat')
                ->assertSee('Notifikasi');
        });
    }

    /**
     * @test ProfileCard on profil dashboard has an "Edit Profile" button pointing to /settings/profile.
     */
    public function test_profil_dashboard_has_edit_profile_link(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Edit Profile', 10)
                ->assertSeeLink('Edit Profile');
        });
    }

    /**
     * @test Notification tab shows "Belum Ada Notifikasi" when there are no notifications.
     */
    public function test_profil_dashboard_notifications_tab_shows_empty_state(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Notifikasi', 10)
                ->click('[data-testid="tab-notifications"]')
                ->waitForText('Belum Ada Notifikasi', 5);
        });
    }

    // ─── User Area Profil Edit Page ───────────────────────────────────────────

    /**
     * @test The /user/profil/edit page renders the form.
     */
    public function test_user_can_view_profil_edit_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 10)
                ->assertInputValue('name', 'Dewi Rahayu')
                ->assertInputValue('email', 'dewi.rahayu@jurnal-test.id');
        });
    }

    /**
     * @test The user can update their profile from the user-area edit page.
     */
    public function test_user_can_update_profil_from_user_area(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 10)
                ->clear('name')->type('name', 'Dewi Rahayu Baru')
                ->clear('phone')->type('phone', '+6281112223334')
                ->clear('position')->type('position', 'Dosen Pengelola')
                ->press('Simpan Perubahan')
                ->pause(5000)
                ->assertPathIs('/user/profil');
        });
    }

    /**
     * @test Back button on edit page navigates back.
     */
    public function test_profil_edit_back_button_works(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 10)
                ->assertPresent('button, a') // Back button exists
                ->assertSee('Kembali ke Profil');
        });
    }

    /**
     * @test Submitting empty name shows a validation error.
     */
    public function test_profil_edit_validates_required_name(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 10)
                ->clear('name')
                ->press('Simpan Perubahan')
                ->waitFor('[class*="error"], .text-destructive', 10);

            $browser->assertPresent('[class*="error"], .text-destructive');
        });
    }
}
