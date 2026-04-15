<?php

namespace Tests\Feature\Controller;

use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminKampusControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $adminKampus;

    private User $regularUser;

    private University $university1;

    private University $university2;

    private Role $superAdminRole;

    private Role $adminKampusRole;

    private Role $userRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Arrange: Create roles
        $this->superAdminRole = Role::create([
            'name' => 'Super Admin',
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        $this->adminKampusRole = Role::create([
            'name' => 'Admin Kampus',
            'display_name' => 'University Administrator',
            'description' => 'University Administrator',
        ]);

        $this->userRole = Role::create([
            'name' => 'User',
            'display_name' => 'Regular User',
            'description' => 'Regular User/Journal Manager',
        ]);

        // Arrange: Create universities
        $this->university1 = University::create([
            'name' => 'Universitas Test 1',
            'code' => 'UT001',
            'short_name' => 'UT1',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'phone' => '021-1111111',
            'email' => 'info@ut1.ac.id',
            'website' => 'https://ut1.ac.id',
            'is_active' => true,
        ]);

        $this->university2 = University::create([
            'name' => 'Universitas Test 2',
            'code' => 'UT002',
            'short_name' => 'UT2',
            'address' => 'Jl. Test No. 2',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'phone' => '022-2222222',
            'email' => 'info@ut2.ac.id',
            'website' => 'https://ut2.ac.id',
            'is_active' => true,
        ]);

        // Arrange: Create users
        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->superAdminRole->id,
            'university_id' => null,
            'is_active' => true,
        ]);

        $this->adminKampus = User::create([
            'name' => 'Admin Kampus Test',
            'email' => 'adminkampus@test.com',
            'password' => bcrypt('password'),
            'phone' => '08123456789',
            'position' => 'IT Manager',
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);

        $this->regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->userRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test: Super Admin can access Admin Kampus index page
     */
    public function test_super_admin_can_access_admin_kampus_index(): void
    {
        // Arrange: Already done in setUp()

        // Act: Super Admin visits Admin Kampus index
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index'));

        // Assert: Page loads successfully with correct component
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AdminKampus/Index')
                ->has('adminKampus')
                ->has('universities')
            );
    }

    /**
     * Test: Non-Super Admin cannot access Admin Kampus index
     */
    public function test_non_super_admin_cannot_access_admin_kampus_index(): void
    {
        // Arrange: Admin Kampus tries to access

        // Act: Admin Kampus visits Admin Kampus index
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin.admin-kampus.index'));

        // Assert: Access denied (403 Forbidden)
        $response->assertForbidden();
    }

    /**
     * Test: Guest cannot access Admin Kampus index
     */
    public function test_guest_cannot_access_admin_kampus_index(): void
    {
        // Arrange: No authentication

        // Act: Guest visits Admin Kampus index
        $response = $this->get(route('admin.admin-kampus.index'));

        // Assert: Redirected to login
        $response->assertRedirect(route('login'));
    }

    /**
     * Test: Index page displays Admin Kampus users with correct data
     */
    public function test_index_page_displays_admin_kampus_users(): void
    {
        // Arrange: Create additional Admin Kampus
        $adminKampus2 = User::create([
            'name' => 'Admin Kampus 2',
            'email' => 'adminkampus2@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university2->id,
            'is_active' => true,
        ]);

        // Act: Get index page
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index'));

        // Assert: Displays both Admin Kampus users
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AdminKampus/Index')
                ->has('adminKampus.data', 2)
                ->where('adminKampus.data.0.name', 'Admin Kampus 2')
                ->where('adminKampus.data.1.name', 'Admin Kampus Test')
            );
    }

    /**
     * Test: Search functionality filters Admin Kampus by name
     */
    public function test_search_filters_admin_kampus_by_name(): void
    {
        // Arrange: Create multiple Admin Kampus
        User::create([
            'name' => 'John Doe Admin',
            'email' => 'john@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);

        // Act: Search for specific name
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index', ['search' => 'John']));

        // Assert: Only matching result returned
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminKampus.data', 1)
                ->where('adminKampus.data.0.name', 'John Doe Admin')
            );
    }

    /**
     * Test: Filter by university works correctly
     */
    public function test_filter_by_university_works(): void
    {
        // Arrange: Create Admin Kampus for university 2
        User::create([
            'name' => 'Admin UT2',
            'email' => 'admin.ut2@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university2->id,
            'is_active' => true,
        ]);

        // Act: Filter by university 2
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index', ['university_id' => $this->university2->id]));

        // Assert: Only university 2 admin returned
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminKampus.data', 1)
                ->where('adminKampus.data.0.university.id', $this->university2->id)
            );
    }

    /**
     * Test: Filter by active status works correctly
     */
    public function test_filter_by_active_status_works(): void
    {
        // Arrange: Create inactive Admin Kampus
        User::create([
            'name' => 'Inactive Admin',
            'email' => 'inactive@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university1->id,
            'is_active' => false,
        ]);

        // Act: Filter by active status
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index', ['is_active' => true]));

        // Assert: Only active admins returned
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminKampus.data', 1)
                ->where('adminKampus.data.0.is_active', true)
            );
    }

    /**
     * Test: Super Admin can access create Admin Kampus form
     */
    public function test_super_admin_can_access_create_form(): void
    {
        // Arrange: Already done in setUp()

        // Act: Visit create form
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.create'));

        // Assert: Form loads with universities list
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AdminKampus/Create')
                ->has('universities')
            );
    }

    /**
     * Test: Non-Super Admin cannot access create form
     */
    public function test_non_super_admin_cannot_access_create_form(): void
    {
        // Arrange: Admin Kampus tries to access

        // Act: Visit create form
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin.admin-kampus.create'));

        // Assert: Access denied
        $response->assertForbidden();
    }

    /**
     * Test: Super Admin can create new Admin Kampus successfully
     */
    public function test_super_admin_can_create_admin_kampus(): void
    {
        // Arrange: Prepare new Admin Kampus data
        $data = [
            'name' => 'New Admin Kampus',
            'email' => 'newadmin@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '08111111111',
            'position' => 'System Administrator',
            'university_id' => $this->university2->id,
            'is_active' => true,
        ];

        // Act: Submit create form
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.store'), $data);

        // Assert: Admin Kampus created successfully
        $response->assertRedirect(route('admin.admin-kampus.index'))
            ->assertSessionHas('success', 'Admin Kampus created successfully.');

        $this->assertDatabaseHas('users', [
            'name' => 'New Admin Kampus',
            'email' => 'newadmin@test.com',
            'phone' => '08111111111',
            'position' => 'System Administrator',
            'university_id' => $this->university2->id,
            'role_id' => $this->adminKampusRole->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test: Create Admin Kampus validates required fields
     */
    public function test_create_admin_kampus_validates_required_fields(): void
    {
        // Arrange: Invalid data (missing required fields)
        $data = [
            'name' => '',
            'email' => '',
            'password' => '',
        ];

        // Act: Submit with invalid data
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.store'), $data);

        // Assert: Validation errors returned
        $response->assertSessionHasErrors(['name', 'email', 'password', 'university_id']);
    }

    /**
     * Test: Create Admin Kampus validates unique email
     */
    public function test_create_admin_kampus_validates_unique_email(): void
    {
        // Arrange: Try to use existing email
        $data = [
            'name' => 'Duplicate Email Admin',
            'email' => $this->adminKampus->email, // Existing email
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'university_id' => $this->university1->id,
            'is_active' => true,
        ];

        // Act: Submit with duplicate email
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.store'), $data);

        // Assert: Email validation error
        $response->assertSessionHasErrors(['email']);
    }

    /**
     * Test: Create Admin Kampus validates password confirmation
     */
    public function test_create_admin_kampus_validates_password_confirmation(): void
    {
        // Arrange: Mismatched password confirmation
        $data = [
            'name' => 'Test Admin',
            'email' => 'test@test.com',
            'password' => 'password123',
            'password_confirmation' => 'different123',
            'university_id' => $this->university1->id,
            'is_active' => true,
        ];

        // Act: Submit with mismatched passwords
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.store'), $data);

        // Assert: Password confirmation error
        $response->assertSessionHasErrors(['password']);
    }

    /**
     * Test: Super Admin can view Admin Kampus details
     */
    public function test_super_admin_can_view_admin_kampus_details(): void
    {
        // Arrange: Create journal for admin kampus
        $journal = Journal::create([
            'user_id' => $this->adminKampus->id,
            'university_id' => $this->university1->id,
            'title' => 'Test Journal',
            'issn' => '1234-5678',
            'e_issn' => '8765-4321',
            'publisher' => 'Test Publisher',
            'editor_in_chief' => 'Test Editor',
            'frequency' => 'quarterly',
            'first_published_year' => 2020,
            'url' => 'https://journal.test.com',
            'is_active' => true,
        ]);

        // Act: View Admin Kampus details
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.show', $this->adminKampus));

        // Assert: Details page loads with correct data
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AdminKampus/Show')
                ->where('adminKampus.id', $this->adminKampus->id)
                ->where('adminKampus.name', 'Admin Kampus Test')
                ->where('adminKampus.journals_count', 1)
                ->has('journals', 1)
            );
    }

    /**
     * Test: Cannot view non-Admin Kampus user as Admin Kampus
     */
    public function test_cannot_view_non_admin_kampus_user(): void
    {
        // Arrange: Try to view regular user

        // Act: Attempt to view regular user through Admin Kampus route
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.show', $this->regularUser));

        // Assert: 404 error
        $response->assertNotFound();
    }

    /**
     * Test: Super Admin can access edit Admin Kampus form
     */
    public function test_super_admin_can_access_edit_form(): void
    {
        // Arrange: Already done in setUp()

        // Act: Visit edit form
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.edit', $this->adminKampus));

        // Assert: Form loads with Admin Kampus data
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AdminKampus/Edit')
                ->where('adminKampus.id', $this->adminKampus->id)
                ->where('adminKampus.name', 'Admin Kampus Test')
                ->has('universities')
            );
    }

    /**
     * Test: Cannot edit non-Admin Kampus user
     */
    public function test_cannot_edit_non_admin_kampus_user(): void
    {
        // Arrange: Try to edit regular user

        // Act: Attempt to edit regular user through Admin Kampus route
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.edit', $this->regularUser));

        // Assert: 404 error
        $response->assertNotFound();
    }

    /**
     * Test: Super Admin can update Admin Kampus successfully
     */
    public function test_super_admin_can_update_admin_kampus(): void
    {
        // Arrange: Updated data
        $data = [
            'name' => 'Updated Admin Name',
            'email' => 'updated@test.com',
            'phone' => '08999999999',
            'position' => 'Senior Manager',
            'university_id' => $this->university2->id,
            'is_active' => false,
        ];

        // Act: Submit update
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.admin-kampus.update', $this->adminKampus), $data);

        // Assert: Admin Kampus updated successfully
        $response->assertRedirect(route('admin.admin-kampus.index'))
            ->assertSessionHas('success', 'Admin Kampus updated successfully.');

        $this->assertDatabaseHas('users', [
            'id' => $this->adminKampus->id,
            'name' => 'Updated Admin Name',
            'email' => 'updated@test.com',
            'phone' => '08999999999',
            'position' => 'Senior Manager',
            'university_id' => $this->university2->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test: Update Admin Kampus can update password
     */
    public function test_update_admin_kampus_can_update_password(): void
    {
        // Arrange: Data with new password
        $data = [
            'name' => $this->adminKampus->name,
            'email' => $this->adminKampus->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'university_id' => $this->adminKampus->university_id,
            'is_active' => true,
        ];

        // Act: Submit update with password
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.admin-kampus.update', $this->adminKampus), $data);

        // Assert: Password updated
        $response->assertRedirect(route('admin.admin-kampus.index'));

        $this->adminKampus->refresh();
        $this->assertTrue(\Hash::check('newpassword123', $this->adminKampus->password));
    }

    /**
     * Test: Update Admin Kampus without password keeps old password
     */
    public function test_update_admin_kampus_without_password_keeps_old_password(): void
    {
        // Arrange: Get old password hash
        $oldPasswordHash = $this->adminKampus->password;

        $data = [
            'name' => 'Updated Name',
            'email' => $this->adminKampus->email,
            'university_id' => $this->adminKampus->university_id,
            'is_active' => true,
        ];

        // Act: Submit update without password
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.admin-kampus.update', $this->adminKampus), $data);

        // Assert: Password unchanged
        $response->assertRedirect(route('admin.admin-kampus.index'));

        $this->adminKampus->refresh();
        $this->assertEquals($oldPasswordHash, $this->adminKampus->password);
    }

    /**
     * Test: Update validates unique email except current user
     */
    public function test_update_validates_unique_email_except_current(): void
    {
        // Arrange: Create another Admin Kampus
        $anotherAdmin = User::create([
            'name' => 'Another Admin',
            'email' => 'another@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university1->id,
            'is_active' => true,
        ]);

        // Try to update with another admin's email
        $data = [
            'name' => $this->adminKampus->name,
            'email' => $anotherAdmin->email, // Duplicate
            'university_id' => $this->adminKampus->university_id,
            'is_active' => true,
        ];

        // Act: Submit update
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.admin-kampus.update', $this->adminKampus), $data);

        // Assert: Email validation error
        $response->assertSessionHasErrors(['email']);
    }

    /**
     * Test: Super Admin can delete Admin Kampus without journals
     */
    public function test_super_admin_can_delete_admin_kampus_without_journals(): void
    {
        // Arrange: Delete the regular user first to avoid managed users constraint
        $this->regularUser->delete();

        // Act: Delete Admin Kampus
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.admin-kampus.destroy', $this->adminKampus));

        // Assert: Admin Kampus soft deleted
        $response->assertRedirect(route('admin.admin-kampus.index'))
            ->assertSessionHas('success', 'Admin Kampus deleted successfully.');

        $this->assertSoftDeleted('users', [
            'id' => $this->adminKampus->id,
        ]);
    }

    /**
     * Test: Cannot delete Admin Kampus with existing journals
     */
    public function test_cannot_delete_admin_kampus_with_journals(): void
    {
        // Arrange: Create journal for admin kampus
        Journal::create([
            'user_id' => $this->adminKampus->id,
            'university_id' => $this->university1->id,
            'title' => 'Test Journal',
            'issn' => '1234-5678',
            'e_issn' => '8765-4321',
            'publisher' => 'Test Publisher',
            'editor_in_chief' => 'Test Editor',
            'frequency' => 'quarterly',
            'first_published_year' => 2020,
            'url' => 'https://journal.test.com',
            'is_active' => true,
        ]);

        // Act: Attempt to delete
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.admin-kampus.destroy', $this->adminKampus));

        // Assert: Deletion prevented with error message
        $response->assertSessionHas('error', 'Cannot delete Admin Kampus with existing managed journals. Please reassign journals first.');

        $this->assertDatabaseHas('users', [
            'id' => $this->adminKampus->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test: Cannot delete Admin Kampus with managed users
     */
    public function test_cannot_delete_admin_kampus_with_managed_users(): void
    {
        // Arrange: Regular user already exists in university1 from setUp()
        // This user is considered "managed" by adminKampus

        // Act: Attempt to delete
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.admin-kampus.destroy', $this->adminKampus));

        // Assert: Deletion prevented with error message
        $response->assertSessionHas('error', 'Cannot delete Admin Kampus with existing managed users. Please reassign or delete users first.');

        $this->assertDatabaseHas('users', [
            'id' => $this->adminKampus->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test: Cannot delete non-Admin Kampus user
     */
    public function test_cannot_delete_non_admin_kampus_user(): void
    {
        // Arrange: Try to delete regular user

        // Act: Attempt to delete through Admin Kampus route
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.admin-kampus.destroy', $this->regularUser));

        // Assert: 404 error
        $response->assertNotFound();
    }

    /**
     * Test: Non-Super Admin cannot delete Admin Kampus
     */
    public function test_non_super_admin_cannot_delete_admin_kampus(): void
    {
        // Arrange: Admin Kampus tries to delete another admin

        // Act: Attempt to delete
        $response = $this->actingAs($this->adminKampus)
            ->delete(route('admin.admin-kampus.destroy', $this->adminKampus));

        // Assert: Access denied
        $response->assertForbidden();
    }

    /**
     * Test: Super Admin can toggle Admin Kampus active status
     */
    public function test_super_admin_can_toggle_admin_kampus_active_status(): void
    {
        // Arrange: Admin Kampus is active
        $this->assertTrue($this->adminKampus->is_active);

        // Act: Toggle to inactive
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.toggle-active', $this->adminKampus));

        // Assert: Status toggled to inactive
        $response->assertSessionHas('success', 'Admin Kampus deactivated successfully.');

        $this->adminKampus->refresh();
        $this->assertFalse($this->adminKampus->is_active);

        // Act: Toggle back to active
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.toggle-active', $this->adminKampus));

        // Assert: Status toggled to active
        $response->assertSessionHas('success', 'Admin Kampus activated successfully.');

        $this->adminKampus->refresh();
        $this->assertTrue($this->adminKampus->is_active);
    }

    /**
     * Test: Cannot toggle active status of non-Admin Kampus user
     */
    public function test_cannot_toggle_active_status_of_non_admin_kampus_user(): void
    {
        // Arrange: Try to toggle regular user

        // Act: Attempt to toggle through Admin Kampus route
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.admin-kampus.toggle-active', $this->regularUser));

        // Assert: 404 error
        $response->assertNotFound();
    }

    /**
     * Test: Non-Super Admin cannot toggle Admin Kampus active status
     */
    public function test_non_super_admin_cannot_toggle_admin_kampus_active_status(): void
    {
        // Arrange: Admin Kampus tries to toggle

        // Act: Attempt to toggle
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin.admin-kampus.toggle-active', $this->adminKampus));

        // Assert: Access denied
        $response->assertForbidden();
    }

    /**
     * Test: Pagination works correctly on index page
     */
    public function test_pagination_works_on_index_page(): void
    {
        // Arrange: Create 15 Admin Kampus users (1 already exists)
        for ($i = 1; $i <= 14; $i++) {
            User::create([
                'name' => "Admin Kampus {$i}",
                'email' => "admin{$i}@test.com",
                'password' => bcrypt('password'),
                'role_id' => $this->adminKampusRole->id,
                'university_id' => $this->university1->id,
                'is_active' => true,
            ]);
        }

        // Act: Get first page
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index'));

        // Assert: First page has 10 items
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminKampus.data', 10)
                ->where('adminKampus.per_page', 10)
            );

        // Act: Get second page
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index', ['page' => 2]));

        // Assert: Second page has remaining 5 items
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminKampus.data', 5)
            );
    }

    /**
     * Test: Index shows journals count for each Admin Kampus
     */
    public function test_index_shows_journals_count(): void
    {
        // Arrange: Create journals for admin kampus
        Journal::create([
            'user_id' => $this->adminKampus->id,
            'university_id' => $this->university1->id,
            'title' => 'Journal 1',
            'issn' => '1111-1111',
            'e_issn' => '1111-2222',
            'publisher' => 'Publisher 1',
            'editor_in_chief' => 'Editor 1',
            'frequency' => 'quarterly',
            'first_published_year' => 2020,
            'url' => 'https://journal1.test.com',
            'is_active' => true,
        ]);

        Journal::create([
            'user_id' => $this->adminKampus->id,
            'university_id' => $this->university1->id,
            'title' => 'Journal 2',
            'issn' => '2222-2222',
            'e_issn' => '2222-3333',
            'publisher' => 'Publisher 2',
            'editor_in_chief' => 'Editor 2',
            'frequency' => 'biannual',
            'first_published_year' => 2021,
            'url' => 'https://journal2.test.com',
            'is_active' => true,
        ]);

        // Act: Get index page
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.index'));

        // Assert: Journals count displayed
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('adminKampus.data.0.journals_count', 2)
            );
    }

    /**
     * Test: Show page displays managed users count
     */
    public function test_show_page_displays_managed_users_count(): void
    {
        // Arrange: Regular user already exists from setUp (1 managed user)

        // Act: View Admin Kampus details
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.admin-kampus.show', $this->adminKampus));

        // Assert: Managed users count displayed
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('adminKampus.managed_users_count', 1)
            );
    }
}
