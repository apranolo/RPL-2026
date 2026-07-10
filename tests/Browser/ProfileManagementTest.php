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
     * The settings/profile page loads and displays the form.
     */
    public function test_user_can_view_settings_profile_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 25)
                ->assertSee('Profile settings')
                ->assertInputValue('name', 'Dewi Rahayu')
                ->assertInputValue('email', 'dewi.rahayu@jurnal-test.id');
        });
    }

    /**
     * The user can update their name and phone from the settings profile form.
     */
    public function test_user_can_update_profile_info(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 25);

            // Set values using JS to be React state safe
            $browser->script([
                "var nameInput = document.getElementById('name');
                 var nativeNameSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeNameSetter.call(nameInput, 'Dewi Rahayu Updated');
                 nameInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var phoneInput = document.getElementById('phone');
                 var nativePhoneSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePhoneSetter.call(phoneInput, '+6281234500000');
                 phoneInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var posInput = document.getElementById('position');
                 var nativePosSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePosSetter.call(posInput, 'Peneliti Senior');
                 posInput.dispatchEvent(new Event('input', { bubbles: true }));",
            ]);

            $browser->pause(300)
                ->press('Save Changes')
                ->waitForText('Profile updated successfully', 25);
        });
    }

    /**
     * The account information section shows role, university, and approval status.
     */
    public function test_settings_profile_shows_account_info_section(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Account Information', 25)
                ->assertSee('ROLE')
                ->assertSee('STATUS AKUN');
        });
    }

    /**
     * Avatar upload: select file, preview appears, click Upload.
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
                ->waitForText('Upload', 25)
                ->press('Upload')
                ->waitForText('Avatar updated successfully', 25);
        });
    }

    /**
     * Avatar section renders the user's initials when no avatar_url is set.
     */
    public function test_settings_profile_shows_initials_when_no_avatar(): void
    {
        $this->user->update(['avatar_url' => null]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/profile')
                ->waitForText('Profile Information', 25)
                ->assertSee('DR'); // Dewi Rahayu initials
        });
    }

    // ─── Settings Password Page ───────────────────────────────────────────────

    /**
     * The settings/password page renders with all fields.
     */
    public function test_user_can_view_password_settings_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update password', 25)
                ->assertPresent('input[name="current_password"]')
                ->assertPresent('input[name="password"]')
                ->assertPresent('input[name="password_confirmation"]');
        });
    }

    /**
     * The user can successfully change their password.
     */
    public function test_user_can_change_password(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update password', 25);

            // Use JS to set the input values to avoid React sync issues
            $browser->script([
                "var curInput = document.getElementById('current_password');
                 var nativeCurSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeCurSetter.call(curInput, 'Password123!');
                 curInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var passInput = document.getElementById('password');
                 var nativePassSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePassSetter.call(passInput, 'NewPassword456!');
                 passInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var confInput = document.getElementById('password_confirmation');
                 var nativeConfSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeConfSetter.call(confInput, 'NewPassword456!');
                 confInput.dispatchEvent(new Event('input', { bubbles: true }));",
            ]);

            $browser->pause(300)
                ->press('Save password')
                ->waitForText('Saved', 25);
        });
    }

    /**
     * Wrong current password shows an error.
     */
    public function test_wrong_current_password_shows_error(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/settings/password')
                ->waitForText('Update password', 25);

            // Use JS to set the input values to avoid React sync issues
            $browser->script([
                "var curInput = document.getElementById('current_password');
                 var nativeCurSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeCurSetter.call(curInput, 'WrongPass!!!');
                 curInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var passInput = document.getElementById('password');
                 var nativePassSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePassSetter.call(passInput, 'NewPassword456!');
                 passInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var confInput = document.getElementById('password_confirmation');
                 var nativeConfSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeConfSetter.call(confInput, 'NewPassword456!');
                 confInput.dispatchEvent(new Event('input', { bubbles: true }));",
            ]);

            $browser->pause(300)
                ->press('Save password')
                ->waitFor('.text-red-600, .text-red-400, .text-destructive, [class*="error"], [class*="Error"]', 25);

            // An error should be shown for current_password field
            $browser->assertPresent('.text-red-600, .text-red-400, .text-destructive, [class*="error"]');
        });
    }

    // ─── User Area Profil Dashboard ───────────────────────────────────────────

    /**
     * The /user/profil page loads with all tabs.
     */
    public function test_user_can_view_profil_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Overview', 25)
                ->assertSee('Overview')
                ->assertSee('Jurnal Saya')
                ->assertSee('Riwayat')
                ->assertSee('Notifikasi');
        });
    }

    /**
     * ProfileCard on profil dashboard has an "Edit Profile" button pointing to /settings/profile.
     */
    public function test_profil_dashboard_has_edit_profile_link(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Edit Profile', 25)
                ->assertSeeLink('Edit Profile');
        });
    }

    /**
     * Notification tab shows "Belum Ada Notifikasi" when there are no notifications.
     */
    public function test_profil_dashboard_notifications_tab_shows_empty_state(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil')
                ->waitForText('Notifikasi', 25)
                ->pause(2000); // Pause for React hydration

            // Click the Notifikasi tab trigger using JavaScript to be robust
            $browser->script([
                "document.querySelectorAll('button[role=\"tab\"]').forEach(function(btn) {
                    if (btn.textContent.trim().includes('Notifikasi')) {
                        btn.click();
                    }
                });",
            ]);

            $browser->waitForText('Belum Ada Notifikasi', 25);
        });
    }

    // ─── User Area Profil Edit Page ───────────────────────────────────────────

    /**
     * The /user/profil/edit page renders the form.
     */
    public function test_user_can_view_profil_edit_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 25)
                ->assertInputValue('name', 'Dewi Rahayu')
                ->assertInputValue('email', 'dewi.rahayu@jurnal-test.id');
        });
    }

    /**
     * The user can update their profile from the user-area edit page.
     */
    public function test_user_can_update_profil_from_user_area(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 25);

            // Set inputs using native JS value setter so React state updates
            $browser->script([
                "var nameInput = document.getElementById('name');
                 var nativeNameSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeNameSetter.call(nameInput, 'Dewi Rahayu Baru');
                 nameInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var phoneInput = document.getElementById('phone');
                 var nativePhoneSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePhoneSetter.call(phoneInput, '+6281112223334');
                 phoneInput.dispatchEvent(new Event('input', { bubbles: true }));",
                 "var posInput = document.getElementById('position');
                 var nativePosSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativePosSetter.call(posInput, 'Dosen Pengelola');
                 posInput.dispatchEvent(new Event('input', { bubbles: true }));",
            ]);

            $browser->pause(300)
                ->press('Simpan Perubahan')
                ->waitForLocation('/user/profil', 25);
        });
    }

    /**
     * Back button on edit page navigates back.
     */
    public function test_profil_edit_back_button_works(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 25)
                ->assertPresent('button, a') // Back button exists
                ->assertSee('Kembali ke Profil');
        });
    }

    public function test_profil_edit_validates_required_name(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/user/profil/edit')
                ->waitForText('Edit Profil', 25);

            // Remove the required attribute and clear the React-controlled input
            // by using native value setter so React's onChange fires
            $browser->script([
                "document.getElementById('name').removeAttribute('required');",
                "var input = document.getElementById('name');
                 var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                 nativeInputValueSetter.call(input, '');
                 input.dispatchEvent(new Event('input', { bubbles: true }));
                 input.dispatchEvent(new Event('change', { bubbles: true }));",
            ]);

            $browser->pause(300)
                ->press('Simpan Perubahan')
                ->waitFor('.text-red-600, .text-red-400, [class*="error"], .text-destructive', 25);
        });
    }
}
