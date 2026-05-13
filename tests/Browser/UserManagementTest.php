<?php

// tests/Browser/UserManagementTest.php

namespace Tests\Browser;

use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Browser tests for User Management by Admin Kampus
 *
 * Tests the following scenarios:
 * 1. Admin Kampus can view user list (only users from their university)
 * 2. Admin Kampus can access create user page
 * 3. Admin Kampus can create new user (auto-assign role & university)
 * 4. Admin Kampus can search users
 * 5. Admin Kampus can filter users by status
 * 6. Admin Kampus can view user details
 * 7. Admin Kampus can edit user
 * 8. Admin Kampus can toggle user active status
 * 9. Admin Kampus can delete user without journals
 * 10. Admin Kampus cannot delete user with journals
 * 11. Admin Kampus cannot access users from other universities
 * 12. Guest cannot access user management
 * 13. Regular User cannot access user management
 *
 * Technical Notes:
 * - Several tests use JavaScript execution via $browser->script() to click buttons.
 * - This is necessary because action buttons are nested inside <a> tags in the UI.
 * - Dusk's standard click() method may fail due to element overlap or event handling issues.
 * - JavaScript clicks ensure we properly trigger the parent link's navigation.
 */
class UserManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected $adminKampus;

    protected $otherAdminKampus;

    protected $university;

    protected $otherUniversity;

    protected $testUser;

    protected $userRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Run seeders
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'UniversitySeeder']);
        $this->artisan('db:seed', ['--class' => 'ScientificFieldSeeder']);

        // Get roles
        $adminKampusRole = Role::where('name', 'Admin Kampus')->first();
        $this->userRole = Role::where('name', 'User')->first();

        // Get universities
        $this->university = University::where('code', 'UAD')->first();
        $this->otherUniversity = University::where('code', 'UMY')->first();

        // Create Admin Kampus for main university
        $this->adminKampus = User::create([
            'name' => 'Admin Kampus UAD',
            'email' => 'admin.kampus.uad@ajm.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        // Create Admin Kampus for other university
        $this->otherAdminKampus = User::create([
            'name' => 'Admin Kampus UMY',
            'email' => 'admin.kampus.umy@ajm.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->otherUniversity->id,
            'is_active' => true,
        ]);

        // Create a test user for this university
        $this->testUser = User::create([
            'name' => 'Test User UAD',
            'email' => 'user.test@uad.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $this->userRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test Admin Kampus can view user index page.
     */
    public function test_admin_kampus_can_view_user_index(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 10)
                ->assertSee('User Management')
                ->assertSee('Add User')
                ->assertSee($this->testUser->name);
        });
    }

    /**
     * Test Admin Kampus can navigate to create page.
     */
    public function test_admin_kampus_can_navigate_to_create_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->click('a[href*="users/create"]')
                ->waitForText('Create New User')
                ->assertPathIs('/admin-kampus/users/create')
                ->assertSee('Personal Information')
                ->assertSee('Account Information')
                // Should see university info (auto-assigned)
                ->assertSee($this->university->name);
        });
    }

    /**
     * Test Admin Kampus can create user with auto-assigned university and role.
     */
    public function test_admin_kampus_can_create_user(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users/create')
                ->waitForText('Create New User', 10)
                ->type('input[id="name"]', 'New Test User')
                ->type('input[id="email"]', 'new.user@uad.ac.id')
                ->type('input[id="phone"]', '081234567890')
                ->type('input[id="position"]', 'Editor')
                ->type('input[id="password"]', 'password123')
                ->type('input[id="password_confirmation"]', 'password123')
                ->press('Create User')
                ->waitForLocation('/admin-kampus/users', 10)
                ->assertSee('User created successfully')
                ->assertSee('New Test User');
        });
    }

    /**
     * Test Admin Kampus can search users.
     */
    public function test_admin_kampus_can_search_users(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management')
                ->type('input[placeholder*="Search"]', 'Test User UAD')
                ->press('Search')
                ->waitForText('Test User UAD')
                ->assertSee('Test User UAD')
                ->assertSee($this->testUser->email);
        });
    }

    /**
     * Test Admin Kampus can filter users by active status.
     */
    public function test_admin_kampus_can_filter_by_status(): void
    {
        // Create an inactive user
        User::create([
            'name' => 'Inactive User UAD',
            'email' => 'inactive.user@uad.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $this->userRole->id,
            'university_id' => $this->university->id,
            'is_active' => false,
        ]);

        $this->browse(function (Browser $browser) {
            // Filter by active
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users?is_active=1')
                ->waitForText('User Management', 10)
                ->assertSee('Test User UAD')
                ->assertDontSee('Inactive User UAD');

            // Filter by inactive
            $browser->visit('/admin-kampus/users?is_active=0')
                ->waitForText('User Management', 10)
                ->assertSee('Inactive User UAD')
                ->assertDontSee('Test User UAD');
        });
    }

    /**
     * Test Admin Kampus can view user details.
     */
    public function test_admin_kampus_can_view_user_details(): void
    {
        $this->browse(function (Browser $browser) {
            // Navigate from index to show page via click
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->assertSee($this->testUser->name);

            // Note: Using JavaScript to click because the button is nested inside an <a> tag.
            // Dusk's standard click() method may fail due to element overlap or event handling.
            // This ensures we click the parent link that contains the "View Details" button.
            $browser->script("document.querySelector('button[title=\"View Details\"]').closest('a').click();");
            $browser->waitForText($this->testUser->email)
                ->assertSee($this->testUser->email);
        });
    }

    /**
     * Test Admin Kampus can navigate to edit page and see form.
     */
    public function test_admin_kampus_can_navigate_to_edit_page(): void
    {
        $this->browse(function (Browser $browser) {
            // Navigate from index to edit page
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->assertSee($this->testUser->name);

            // Note: Using JavaScript to click because the button is nested inside an <a> tag.
            // Dusk's standard click() method may fail due to element overlap or event handling.
            // This ensures we click the parent link that contains the "Edit User" button.
            $browser->script("document.querySelector('button[title=\"Edit User\"]').closest('a').click();");
            $browser->waitForText('Personal Information')
                ->assertSee('Personal Information')
                ->assertInputValue('input[id="name"]', $this->testUser->name);
        });
    }

    /**
     * Test Admin Kampus can update user information.
     */
    public function test_admin_kampus_can_update_user(): void
    {
        $this->browse(function (Browser $browser) {
            // Navigate from index to edit page
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->assertSee($this->testUser->name);

            // Note: Using JavaScript to click because the button is nested inside an <a> tag.
            // Dusk's standard click() method may fail due to element overlap or event handling.
            // This ensures we click the parent link that contains the "Edit User" button.
            $browser->script("document.querySelector('button[title=\"Edit User\"]').closest('a').click();");
            $browser->waitFor('input[id="name"]', 15)
                ->clear('input[id="name"]')
                ->type('input[id="name"]', 'Updated User Name')
                ->press('Update User')
                ->waitForText('Updated User Name')
                ->assertSee('Updated User Name');
        });
    }

    /**
     * Test Admin Kampus can toggle user active status.
     */
    public function test_admin_kampus_can_toggle_user_status(): void
    {
        // Verify user starts as active
        $this->assertTrue($this->testUser->is_active);

        $this->browse(function (Browser $browser) {
            // Navigate from index to show page
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->assertSee($this->testUser->name);

            // Use script to click the first eye icon button's parent link
            $browser->script("document.querySelector('button[title=\"View Details\"]').closest('a').click();");
            $browser->waitForText($this->testUser->name)
                ->assertSee($this->testUser->name);

            // Click toggle button - user is active, so button says "Deactivate"
            $browser->press('Deactivate')
                ->waitForText('Activate'); // Wait for button text to change
        });

        // Verify user is now inactive
        $this->testUser->refresh();
        $this->assertFalse($this->testUser->is_active);
    }

    /**
     * Test Admin Kampus can delete user without journals.
     */
    public function test_admin_kampus_can_delete_user_without_journals(): void
    {
        // Create a user specifically for deletion
        $deleteUser = User::create([
            'name' => 'Delete Me User',
            'email' => 'delete.me@uad.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $this->userRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        // Verify user exists
        $this->assertDatabaseHas('users', ['email' => 'delete.me@uad.ac.id']);

        $this->browse(function (Browser $browser) {
            // Navigate from index - search for the delete user first
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->type('input[placeholder*="Search"]', 'Delete Me User')
                ->press('Search')
                ->waitForText('Delete Me User')
                ->assertSee('Delete Me User');

            // Helper to click a button by its title attribute using JavaScript.
            // Note: JavaScript execution is necessary because buttons are nested inside <a> tags,
            // and Dusk's standard click() method may fail due to element overlap or event handling.
            // This helper ensures we click the parent link that wraps the button.
            $clickButtonByTitle = function (Browser $browser, string $title): void {
                $browser->script("document.querySelector('button[title=\"{$title}\"]').closest('a').click();");
            };

            // Use helper to click the first "View Details" button's parent link
            $clickButtonByTitle($browser, 'View Details');
            $browser->waitForText('Delete Me User')
                ->assertSee('Delete Me User');

            // Click delete button
            $browser->press('Delete')
                ->waitForDialog()
                // Handle browser confirm dialog
                ->acceptDialog()
                ->waitForLocation('/admin-kampus/users'); // Wait for deletion to complete
        });

        // Verify user is deleted
        $this->assertDatabaseMissing('users', ['email' => 'delete.me@uad.ac.id']);
    }

    /**
     * Test Admin Kampus cannot delete user with journals.
     */
    public function test_admin_kampus_cannot_delete_user_with_journals(): void
    {
        // Create a journal for the test user (with required university_id)
        $scientificField = ScientificField::first();
        Journal::create([
            'title' => 'Test Journal',
            'issn' => '1234-5678',
            'publisher' => 'Test Publisher',
            'scientific_field_id' => $scientificField->id,
            'user_id' => $this->testUser->id,
            'university_id' => $this->university->id, // Required field
            'is_active' => true,
        ]);

        // Verify user exists before deletion attempt
        $this->assertDatabaseHas('users', ['email' => $this->testUser->email]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 15)
                ->type('input[placeholder*="Search"]', 'Test User UAD')
                ->press('Search')
                ->waitForText('Test User UAD')
                ->assertSee('Test User UAD');

            // Navigate to user detail page
            $browser->script("document.querySelector('button[title=\"View Details\"]').closest('a').click();");
            $browser->waitForText($this->testUser->email)
                ->assertSee($this->testUser->email);

            // Attempt to delete user with journals
            $browser->press('Delete')
                ->waitForDialog()
                ->acceptDialog();

            // Should show error message or stay on same page
            // Verify user still exists in database
            $this->assertDatabaseHas('users', ['email' => $this->testUser->email]);
        });
    }

    /**
     * Test Admin Kampus cannot access users from other universities.
     */
    public function test_admin_kampus_cannot_access_other_university_users(): void
    {
        // Create user in other university
        $otherUser = User::create([
            'name' => 'Other University User',
            'email' => 'other.user@umy.ac.id',
            'password' => bcrypt('password123'),
            'role_id' => $this->userRole->id,
            'university_id' => $this->otherUniversity->id,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($otherUser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users')
                ->waitForText('User Management', 10)
                // Should not see user from other university
                ->assertDontSee('Other University User');

            // Try to access user detail directly - should fail (404 or 403)
            // The controller returns 404 for users not in admin's university
            $browser->visit('/admin-kampus/users/'.$otherUser->id);

            // Should not be on the show page - should see error or be redirected
            $browser->assertDontSee('Contact Information')
                ->assertDontSee('Activity & Statistics');
        });
    }

    /**
     * Test guest cannot access user management.
     */
    public function test_guest_cannot_access_user_management(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->logout()
                ->visit('/admin-kampus/users')
                ->assertPathIs('/login');
        });
    }

    /**
     * Test regular User cannot access user management.
     */
    public function test_regular_user_cannot_access_user_management(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->testUser)
                ->visit('/admin-kampus/users')
                ->waitForText('403')
                // Should be forbidden or redirected
                ->assertSee('403');
        });
    }

    /**
     * Test email uniqueness validation.
     */
    public function test_create_user_validates_email_uniqueness(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminKampus)
                ->visit('/admin-kampus/users/create')
                ->waitForText('Create New User', 10)
                ->type('input[id="name"]', 'Duplicate Email User')
                // Use existing user's email
                ->type('input[id="email"]', $this->testUser->email)
                ->type('input[id="password"]', 'password123')
                ->type('input[id="password_confirmation"]', 'password123')
                ->press('Create User')
                ->waitForText('The email has already been taken.');

            // Should show validation error - check that we're still on create page
            // (not redirected to index) which means validation failed
            $browser->assertPathIs('/admin-kampus/users/create');
        });
    }
}
