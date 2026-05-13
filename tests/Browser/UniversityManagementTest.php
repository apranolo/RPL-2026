<?php

namespace Tests\Browser;

use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class UniversityManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $superAdmin;

    protected Role $superAdminRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Super Admin role and user
        $this->superAdminRole = Role::create([
            'name' => 'Super Admin',
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->superAdminRole->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test: Visit /admin/universities → See list ✅
     */
    public function test_super_admin_can_visit_universities_list(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->pause(3000)  // Wait longer for React to render (first test needs more time)
                ->assertPathIs('/admin/universities')
                ->assertSee('Universities Management')
                ->assertSee('Add University');
        });
    }

    /**
     * Test: Search by name/code → Filter works ✅
     */
    public function test_super_admin_can_search_universities(): void
    {
        // Create test universities
        $university1 = University::create([
            'name' => 'University of Technology',
            'code' => 'UT001',
            'type' => 'negeri',
            'accreditation' => 'A',
            'province' => 'Jakarta',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Test No. 1',
            'phone' => '021-1111111',
            'email' => 'ut@test.com',
            'website' => 'https://ut.test.com',
            'is_active' => true,
        ]);

        $university2 = University::create([
            'name' => 'Institute of Science',
            'code' => 'IS002',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Bandung',
            'city' => 'Bandung',
            'address' => 'Jl. Test No. 2',
            'phone' => '022-2222222',
            'email' => 'is@test.com',
            'website' => 'https://is.test.com',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university1, $university2) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->waitForText('Universities Management', 10)
                ->assertSee($university1->name)
                ->assertSee($university2->name)
                // Search by name
                ->type('input[placeholder*="Search by name"]', 'Technology')
                ->press('Search')
                ->pause(2000) // Wait for Inertia to update
                ->assertSee($university1->name)
                ->assertDontSee($university2->name)
                // Clear and search by code
                ->press('Clear')
                ->pause(2000) // Wait for Inertia to update
                ->assertSee($university1->name)
                ->assertSee($university2->name)
                ->type('input[placeholder*="Search by name"]', $university2->code)
                ->press('Search')
                ->pause(2000) // Wait for Inertia to update
                ->assertDontSee($university1->name)
                ->assertSee($university2->name);
        });
    }

    /**
     * Test: Click "Add University" → Form appears ✅
     */
    public function test_super_admin_can_access_create_form(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->pause(2000)  // Wait for page to fully load
                ->clickLink('Add University')
                ->pause(2000)  // Wait for navigation
                ->assertPathIs('/admin/universities/create')
                ->assertSee('Create New University')
                ->assertSee('Basic Information')
                ->assertSee('University Code')
                ->assertSee('Full Name')
                ->assertSee('Address Information')
                ->assertSee('Contact Information')
                ->assertSee('Province')
                ->assertSee('City')
                ->assertSee('Phone')
                ->assertSee('Email')
                ->assertSee('Website');
        });
    }

    /**
     * Test: Fill form & submit → University created ✅
     */
    public function test_super_admin_can_create_university(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities/create')
                ->pause(2000)  // Wait for form to load
                // Basic Information
                ->type('#code', 'NTU123')
                ->type('#name', 'New Test University')
                ->type('#short_name', 'NTU')
                // Address Information
                ->type('#address', 'Jl. Sudirman No. 123')
                ->type('#city', 'Jakarta Pusat')
                ->type('#province', 'DKI Jakarta')
                ->type('#postal_code', '10110')
                // Contact Information
                ->type('#phone', '021-3456789')
                ->type('#email', 'info@ntu.ac.id')
                ->type('#website', 'https://ntu.ac.id')
                ->screenshot('before-submit')
                ->scrollIntoView('button[type="submit"]')
                ->pause(500)
                ->click('button[type="submit"]')
                ->pause(5000)  // Wait longer for form submission
                ->screenshot('after-submit');

            // Check if still on create page (validation error)
            $currentPath = $browser->driver->getCurrentURL();
            if (str_contains($currentPath, '/create')) {
                // There might be validation errors, let's see them
                $pageSource = $browser->driver->getPageSource();
                $this->fail('Form submission failed. Still on create page. Check screenshots.');
            }

            $browser->assertPathIs('/admin/universities')
                ->pause(1000)
                ->assertSee('New Test University');

            // Verify in database
            $this->assertDatabaseHas('universities', [
                'name' => 'New Test University',
                'code' => 'NTU123',
            ]);
        });
    }

    /**
     * Test: Click Edit → Form pre-filled ✅
     */
    public function test_super_admin_can_access_edit_form_with_prefilled_data(): void
    {
        $university = University::create([
            'name' => 'Edit Test University',
            'code' => 'ETU456',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'address' => 'Jl. Edit No. 1',
            'phone' => '022-1234567',
            'email' => 'edit@test.ac.id',
            'website' => 'https://edit.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit("/admin/universities/{$university->id}/edit")
                ->pause(2000)  // Wait for edit page to load
                ->assertPathIs("/admin/universities/{$university->id}/edit")
                ->assertSee('Edit University')
                ->assertInputValue('#name', $university->name)
                ->assertInputValue('#code', $university->code)
                ->assertInputValue('#short_name', $university->short_name)
                ->assertInputValue('#province', $university->province)
                ->assertInputValue('#city', $university->city)
                ->assertInputValue('#address', $university->address)
                ->assertInputValue('#phone', $university->phone)
                ->assertInputValue('#email', $university->email)
                ->assertInputValue('#website', $university->website);
        });
    }

    /**
     * Test: Update & submit → University updated ✅
     */
    public function test_super_admin_can_update_university(): void
    {
        $university = University::create([
            'name' => 'Old University Name',
            'code' => 'OUN789',
            'type' => 'negeri',
            'accreditation' => 'B',
            'province' => 'Jawa Timur',
            'city' => 'Surabaya',
            'address' => 'Jl. Old Address',
            'phone' => '031-1111111',
            'email' => 'old@test.ac.id',
            'website' => 'https://old.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit("/admin/universities/{$university->id}/edit")
                ->pause(2000)  // Wait for form to load
                ->clear('#name')
                ->type('#name', 'Updated University Name')
                ->clear('#short_name')
                ->type('#short_name', 'UUN')
                ->clear('#province')
                ->type('#province', 'Jawa Tengah')
                ->clear('#city')
                ->type('#city', 'Semarang')
                ->clear('#address')
                ->type('#address', 'Jl. Updated Address No. 123')
                ->scrollIntoView('button[type="submit"]')
                ->pause(500)
                ->click('button[type="submit"]')
                ->pause(5000)  // Wait for form submission
                ->assertPathIs('/admin/universities')
                ->pause(1000)
                ->assertSee('Updated University Name');

            // Verify in database
            $this->assertDatabaseHas('universities', [
                'id' => $university->id,
                'name' => 'Updated University Name',
                'short_name' => 'UUN',
                'province' => 'Jawa Tengah',
                'city' => 'Semarang',
                'address' => 'Jl. Updated Address No. 123',
            ]);
        });
    }

    /**
     * Test: Click Delete → Confirmation & delete ✅
     */
    public function test_super_admin_can_delete_university(): void
    {
        $university = University::create([
            'name' => 'Delete Test University',
            'code' => 'DTU001',
            'short_name' => 'DTU',
            'province' => 'Bali',
            'city' => 'Denpasar',
            'address' => 'Jl. Delete No. 1',
            'phone' => '0361-111111',
            'email' => 'delete@test.ac.id',
            'website' => 'https://delete.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->pause(2000)  // Wait for table to load
                ->assertSee($university->name);

            // Find and click the delete button (Trash icon) in the first row
            // The button has onClick handler that triggers confirm dialog
            $browser->with('table tbody tr:first-child', function ($row) {
                $row->click('button:has(svg.text-red-600)');
            })
                ->pause(500);

            // Accept the browser confirm dialog
            $browser->acceptDialog()
                ->pause(3000)  // Wait for deletion to complete
                ->assertPathIs('/admin/universities')
                ->assertDontSee($university->name);

            // Verify deleted from database (soft delete)
            $this->assertSoftDeleted('universities', [
                'id' => $university->id,
            ]);
        });
    }

    /**
     * Test: Try delete university with journals → Error message ✅
     */
    public function test_super_admin_cannot_delete_university_with_journals(): void
    {
        $university = University::create([
            'name' => 'University with Journals',
            'code' => 'UWJ001',
            'short_name' => 'UWJ',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta',
            'address' => 'Jl. Journal No. 1',
            'phone' => '021-9999999',
            'email' => 'uwj@test.ac.id',
            'website' => 'https://uwj.test.ac.id',
            'is_active' => true,
        ]);

        // Create a journal for this university
        Journal::create([
            'user_id' => $this->superAdmin->id,  // Add user_id (journal owner)
            'university_id' => $university->id,
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

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->pause(2000)  // Wait for table to load
                ->assertSee($university->name);

            // Try to delete university with journals
            $browser->with('table tbody tr:first-child', function ($row) {
                $row->click('button:has(svg.text-red-600)');
            })
                ->pause(500);

            // Accept the browser confirm dialog
            $browser->acceptDialog()
                ->pause(3000)  // Wait for response
                ->assertPathIs('/admin/universities')
                // Should see error message (university not deleted because has journals)
                ->assertSee($university->name);  // University should still be visible

            // Verify NOT deleted from database
            $this->assertDatabaseHas('universities', [
                'id' => $university->id,
                'deleted_at' => null,  // Not soft deleted
            ]);
        });
    }

    /**
     * Test: Pagination works ✅
     */
    public function test_super_admin_can_navigate_pagination(): void
    {
        // Create 25 universities to test pagination (assuming 10 per page)
        for ($i = 1; $i <= 25; $i++) {
            University::create([
                'name' => "Test University {$i}",
                'code' => 'TU'.str_pad($i, 3, '0', STR_PAD_LEFT),
                'short_name' => "TU{$i}",
                'province' => 'Jakarta',
                'city' => 'Jakarta',
                'address' => "Jl. Test No. {$i}",
                'phone' => '021-'.str_pad($i, 7, '0', STR_PAD_LEFT),
                'email' => "test{$i}@test.ac.id",
                'website' => "https://test{$i}.ac.id",
                'is_active' => true,
            ]);
        }

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->pause(2000)  // Wait for table to load
                ->assertSee('Test University 1')
                // Check if pagination exists (page 2 link)
                ->assertSeeLink('2')
                // Navigate to page 2
                ->clickLink('2')
                ->pause(2000)  // Wait for Inertia navigation
                ->assertQueryStringHas('page', '2')
                // Should see universities from page 2
                ->assertSee('Test University')
                // Navigate back to page 1
                ->clickLink('1')
                ->pause(2000)
                ->assertQueryStringHas('page', '1')
                ->assertSee('Test University 1');
        });
    }

    /**
     * Bonus Test: Verify all universities are visible to Super Admin
     */
    public function test_super_admin_can_see_all_universities_regardless_of_type(): void
    {
        $negeri = University::create([
            'name' => 'Negeri University',
            'code' => 'NU001',
            'type' => 'negeri',
            'accreditation' => 'A',
            'province' => 'Jakarta',
            'city' => 'Jakarta',
            'address' => 'Jl. Negeri',
            'phone' => '021-1111111',
            'email' => 'negeri@test.ac.id',
            'website' => 'https://negeri.ac.id',
            'is_active' => true,
        ]);

        $swasta = University::create([
            'name' => 'Swasta University',
            'code' => 'SU002',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Bandung',
            'city' => 'Bandung',
            'address' => 'Jl. Swasta',
            'phone' => '022-2222222',
            'email' => 'swasta@test.ac.id',
            'website' => 'https://swasta.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($negeri, $swasta) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee($negeri->name)
                ->assertSee($swasta->name);
        });
    }
}
