<?php

namespace Tests\Feature\Controller;

use App\Models\Announcement;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnnouncementControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $adminKampus;

    private University $university;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles (required for tests)
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create Super Admin user
        $this->superAdmin = User::factory()->create([
            'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
            'university_id' => University::factory()->create()->id,
            'is_active' => true,
        ]);

        // Create non-Super Admin user for authorization tests
        $this->adminKampus = User::factory()->create([
            'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->first()->id,
            'university_id' => University::factory()->create()->id,
            'is_active' => true,
        ]);

        // Create university for announcements
        $this->university = University::factory()->create();
    }

    // ============================================================================
    // INDEX TESTS
    // ============================================================================

    public function test_super_admin_can_view_announcements_index_page(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Announcements/Index')
                ->has('announcements')
                ->has('universities')
                ->has('filters')
            );
    }

    public function test_non_super_admin_cannot_view_announcements_index_page(): void
    {
        $this->actingAs($this->adminKampus)
            ->get(route('admin.announcements.index'))
            ->assertForbidden();
    }

    public function test_index_page_includes_search_filter_by_title(): void
    {
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'title' => 'Important News About System',
        ]);
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'title' => 'Maintenance Schedule',
        ]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index', ['search' => 'Important']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('announcements.data', 1)
            );
    }

    public function test_index_page_includes_search_filter_by_content(): void
    {
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'title' => 'News 1',
            'content' => 'System will be down for maintenance',
        ]);
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'title' => 'News 2',
            'content' => 'New features available',
        ]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index', ['search' => 'maintenance']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('announcements.data', 1)
            );
    }

    public function test_index_page_includes_university_filter(): void
    {
        $university2 = University::factory()->create();
        Announcement::factory()->create(['university_id' => $this->university->id]);
        Announcement::factory()->create(['university_id' => $university2->id]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index', ['university_id' => $this->university->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('announcements.data', 1)
            );
    }

    public function test_index_page_includes_active_status_filter(): void
    {
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_active' => false,
        ]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index', ['is_active' => true]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('announcements.data', 1)
            );
    }

    public function test_index_page_includes_published_status_filter(): void
    {
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'published_at' => now()->subDay(),
        ]);
        Announcement::factory()->create([
            'university_id' => $this->university->id,
            'published_at' => now()->addDay(),
        ]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.index', ['is_published' => true]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('announcements.data', 1)
            );
    }

    // ============================================================================
    // CREATE TESTS
    // ============================================================================

    public function test_super_admin_can_view_create_announcement_page(): void
    {
        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Announcements/Create')
                ->has('universities')
            );
    }

    public function test_non_super_admin_cannot_view_create_announcement_page(): void
    {
        $this->actingAs($this->adminKampus)
            ->get(route('admin.announcements.create'))
            ->assertForbidden();
    }

    // ============================================================================
    // STORE TESTS
    // ============================================================================

    public function test_super_admin_can_create_new_announcement(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'title' => 'New Announcement Title',
            'content' => 'This is the announcement content with detailed information.',
            'description' => 'Short description',
            'published_at' => now()->format('Y-m-d H:i'),
            'expires_at' => now()->addDays(7)->format('Y-m-d H:i'),
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertRedirect(route('admin.announcements.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('announcements', [
            'title' => 'New Announcement Title',
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);
    }

    public function test_non_super_admin_cannot_create_announcement(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'title' => 'Test Announcement',
            'content' => 'Test content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->adminKampus)
            ->post(route('admin.announcements.store'), $data)
            ->assertForbidden();
    }

    public function test_announcement_creation_requires_title(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'content' => 'Test content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertSessionHasErrors('title');
    }

    public function test_announcement_creation_requires_content(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'title' => 'Test Title',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertSessionHasErrors('content');
    }

    public function test_announcement_creation_requires_valid_university_id(): void
    {
        $data = [
            'university_id' => 999,
            'title' => 'Test Title',
            'content' => 'Test content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertSessionHasErrors('university_id');
    }

    public function test_announcement_creation_auto_generates_slug(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'title' => 'My Announcement Title',
            'content' => 'Test content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data);

        $this->assertDatabaseHas('announcements', [
            'title' => 'My Announcement Title',
            'slug' => 'my-announcement-title',
        ]);
    }

    public function test_announcement_creation_with_thumbnail_upload(): void
    {
        Storage::fake('public');

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Announcement with Image',
            'content' => 'Test content',
            'thumbnail' => UploadedFile::fake()->image('thumbnail.jpg'),
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertRedirect(route('admin.announcements.index'));

        $announcement = Announcement::where('title', 'Announcement with Image')->first();
        $this->assertNotNull($announcement->thumbnail);
        Storage::disk('public')->assertExists($announcement->thumbnail);
    }

    public function test_announcement_creation_validates_thumbnail_is_image(): void
    {
        Storage::fake('public');

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Test Title',
            'content' => 'Test content',
            'thumbnail' => UploadedFile::fake()->create('thumbnail.pdf'),
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertSessionHasErrors('thumbnail');
    }

    public function test_announcement_creation_requires_expires_at_after_or_equal_published_at(): void
    {
        $data = [
            'university_id' => $this->university->id,
            'title' => 'Test Title',
            'content' => 'Test content',
            'published_at' => now()->addDays(5)->format('Y-m-d H:i'),
            'expires_at' => now()->format('Y-m-d H:i'),
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.store'), $data)
            ->assertSessionHasErrors('expires_at');
    }

    // ============================================================================
    // SHOW TESTS
    // ============================================================================

    public function test_super_admin_can_view_announcement_details(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.show', $announcement))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Announcements/Show')
                ->has('announcement')
            );
    }

    public function test_non_super_admin_cannot_view_announcement_details(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->adminKampus)
            ->get(route('admin.announcements.show', $announcement))
            ->assertForbidden();
    }

    // ============================================================================
    // EDIT TESTS
    // ============================================================================

    public function test_super_admin_can_view_edit_announcement_page(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->superAdmin)
            ->get(route('admin.announcements.edit', $announcement))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Announcements/Edit')
                ->has('announcement')
                ->has('universities')
            );
    }

    public function test_non_super_admin_cannot_view_edit_announcement_page(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->adminKampus)
            ->get(route('admin.announcements.edit', $announcement))
            ->assertForbidden();
    }

    // ============================================================================
    // UPDATE TESTS
    // ============================================================================

    public function test_super_admin_can_update_announcement(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'title' => 'Original Title',
            'is_active' => false,
        ]);

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'description' => 'Updated description',
            'published_at' => now()->format('Y-m-d H:i'),
            'is_active' => true,
            'is_featured' => true,
        ];

        $this->actingAs($this->superAdmin)
            ->put(route('admin.announcements.update', $announcement), $data)
            ->assertRedirect(route('admin.announcements.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'title' => 'Updated Title',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    public function test_non_super_admin_cannot_update_announcement(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->adminKampus)
            ->put(route('admin.announcements.update', $announcement), $data)
            ->assertForbidden();
    }

    public function test_announcement_update_preserves_thumbnail_if_not_replaced(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'thumbnail' => 'announcements/old-image.jpg',
        ]);

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->put(route('admin.announcements.update', $announcement), $data);

        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'thumbnail' => 'announcements/old-image.jpg',
        ]);
    }

    public function test_announcement_update_replaces_thumbnail(): void
    {
        Storage::fake('public');

        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'thumbnail' => 'announcements/old-image.jpg',
        ]);

        $data = [
            'university_id' => $this->university->id,
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'thumbnail' => UploadedFile::fake()->image('new-thumbnail.jpg'),
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->put(route('admin.announcements.update', $announcement), $data);

        $updated = $announcement->fresh();
        $this->assertNotEquals('announcements/old-image.jpg', $updated->thumbnail);
        Storage::disk('public')->assertExists($updated->thumbnail);
    }

    public function test_announcement_update_requires_title(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $data = [
            'university_id' => $this->university->id,
            'content' => 'Updated content',
            'is_active' => true,
            'is_featured' => false,
        ];

        $this->actingAs($this->superAdmin)
            ->put(route('admin.announcements.update', $announcement), $data)
            ->assertSessionHasErrors('title');
    }

    // ============================================================================
    // DESTROY TESTS
    // ============================================================================

    public function test_super_admin_can_delete_announcement(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->superAdmin)
            ->delete(route('admin.announcements.destroy', $announcement))
            ->assertRedirect(route('admin.announcements.index'))
            ->assertSessionHas('success');

        $this->assertNotNull($announcement->fresh()->deleted_at);
    }

    public function test_non_super_admin_cannot_delete_announcement(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->adminKampus)
            ->delete(route('admin.announcements.destroy', $announcement))
            ->assertForbidden();
    }

    public function test_announcement_deletion_deletes_thumbnail_file(): void
    {
        Storage::fake('public');

        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'thumbnail' => 'announcements/test-image.jpg',
        ]);

        // Create the file in storage
        Storage::disk('public')->put('announcements/test-image.jpg', 'test content');

        $this->actingAs($this->superAdmin)
            ->delete(route('admin.announcements.destroy', $announcement));

        Storage::disk('public')->assertMissing('announcements/test-image.jpg');
    }

    public function test_soft_deleted_announcement_can_be_restored(): void
    {
        $announcement = Announcement::factory()->create(['university_id' => $this->university->id]);

        $this->actingAs($this->superAdmin)
            ->delete(route('admin.announcements.destroy', $announcement));

        $announcement->restore();

        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'deleted_at' => null,
        ]);
    }

    // ============================================================================
    // TOGGLE FEATURED TESTS
    // ============================================================================

    public function test_super_admin_can_toggle_announcement_featured_status(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_featured' => false,
        ]);

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.toggle-featured', $announcement))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertTrue($announcement->fresh()->is_featured);
    }

    public function test_toggle_featured_changes_to_unfeatured(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_featured' => true,
        ]);

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.toggle-featured', $announcement));

        $this->assertFalse($announcement->fresh()->is_featured);
    }

    public function test_non_super_admin_cannot_toggle_featured_status(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_featured' => false,
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin.announcements.toggle-featured', $announcement))
            ->assertForbidden();
    }

    // ============================================================================
    // TOGGLE ACTIVE TESTS
    // ============================================================================

    public function test_super_admin_can_toggle_announcement_active_status(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_active' => false,
        ]);

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.toggle-active', $announcement))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertTrue($announcement->fresh()->is_active);
    }

    public function test_toggle_active_changes_to_deactivated(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->superAdmin)
            ->post(route('admin.announcements.toggle-active', $announcement));

        $this->assertFalse($announcement->fresh()->is_active);
    }

    public function test_non_super_admin_cannot_toggle_active_status(): void
    {
        $announcement = Announcement::factory()->create([
            'university_id' => $this->university->id,
            'is_active' => false,
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin.announcements.toggle-active', $announcement))
            ->assertForbidden();
    }
}
