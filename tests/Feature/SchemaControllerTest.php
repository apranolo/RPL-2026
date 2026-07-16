<?php

namespace Tests\Feature;

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * SchemaControllerTest
 *
 * Feature test untuk memverifikasi fungsionalitas CRUD
 * Skema Penelitian (ResearchSchema) melalui SchemaController.
 *
 * @covers \App\Http\Controllers\SchemaController
 */
class SchemaControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $regularUser;

    private Role $superAdminRole;

    private Role $userRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Arrange: Create roles
        $this->superAdminRole = Role::create([
            'name'         => 'Super Admin',
            'display_name' => 'Super Administrator',
            'description'  => 'Super Administrator with full access',
        ]);

        $this->userRole = Role::create([
            'name'         => 'User',
            'display_name' => 'Regular User',
            'description'  => 'Regular User/Journal Manager',
        ]);

        // Arrange: Create users
        $this->superAdmin = User::create([
            'name'      => 'Super Admin',
            'email'     => 'superadmin@test.com',
            'password'  => bcrypt('password'),
            'role_id'   => $this->superAdminRole->id,
            'is_active' => true,
        ]);

        $this->regularUser = User::create([
            'name'      => 'Regular User',
            'email'     => 'user@test.com',
            'password'  => bcrypt('password'),
            'role_id'   => $this->userRole->id,
            'is_active' => true,
        ]);
    }

    // =========================================================================
    // INDEX
    // =========================================================================

    /**
     * Test: Super Admin dapat mengakses halaman daftar skema penelitian
     */
    public function test_super_admin_can_access_schema_index(): void
    {
        // Arrange: Buat beberapa skema
        ResearchSchema::create(['name' => 'Penelitian Dasar', 'description' => 'Deskripsi A']);
        ResearchSchema::create(['name' => 'Penelitian Terapan', 'description' => 'Deskripsi B']);

        // Act: Super Admin mengakses halaman index
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.schema.index'));

        // Assert: Halaman berhasil dimuat dengan data skema
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Schema/Index')
                ->has('schemas')
                ->has('filters')
            );
    }

    /**
     * Test: User biasa tidak dapat mengakses halaman daftar skema (403)
     */
    public function test_regular_user_cannot_access_schema_index(): void
    {
        // Act: Regular user mencoba mengakses index
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.schema.index'));

        // Assert: Ditolak dengan 403 Forbidden
        $response->assertForbidden();
    }

    /**
     * Test: Tamu tidak dapat mengakses halaman daftar skema (redirect login)
     */
    public function test_guest_cannot_access_schema_index(): void
    {
        // Act: Tamu mencoba mengakses index
        $response = $this->get(route('admin.schema.index'));

        // Assert: Diarahkan ke halaman login
        $response->assertRedirect(route('login'));
    }

    /**
     * Test: Fitur pencarian memfilter skema berdasarkan nama
     */
    public function test_search_filters_schemas_by_name(): void
    {
        // Arrange: Buat beberapa skema dengan nama berbeda
        ResearchSchema::create(['name' => 'Penelitian Dasar']);
        ResearchSchema::create(['name' => 'PDUPT']);
        ResearchSchema::create(['name' => 'Penelitian Terapan']);

        // Act: Cari dengan kata kunci 'Penelitian'
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.schema.index', ['search' => 'Penelitian']));

        // Assert: Hanya skema yang mengandung 'Penelitian' yang ditampilkan
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('schemas.data', 2)
            );
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * Test: Super Admin dapat mengakses halaman form tambah skema
     */
    public function test_super_admin_can_access_create_form(): void
    {
        // Act: Kunjungi halaman create
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.schema.create'));

        // Assert: Halaman create berhasil dimuat
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Schema/Create')
            );
    }

    /**
     * Test: User biasa tidak dapat mengakses halaman form tambah skema
     */
    public function test_regular_user_cannot_access_create_form(): void
    {
        // Act: User biasa mencoba mengakses form
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.schema.create'));

        // Assert: Ditolak
        $response->assertForbidden();
    }

    // =========================================================================
    // STORE
    // =========================================================================

    /**
     * Test: Super Admin dapat membuat skema penelitian baru
     */
    public function test_super_admin_can_create_schema(): void
    {
        // Arrange: Data skema baru
        $data = [
            'name'        => 'Penelitian Dasar',
            'description' => 'Skema untuk penelitian dasar',
        ];

        // Act: Submit form tambah
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), $data);

        // Assert: Redirect ke index dengan pesan sukses
        $response->assertRedirect(route('admin.schema.index'))
            ->assertSessionHas('success', "Skema Penelitian 'Penelitian Dasar' berhasil ditambahkan.");

        // Assert: Data tersimpan di database
        $this->assertDatabaseHas('research_schemas', [
            'name'        => 'Penelitian Dasar',
            'description' => 'Skema untuk penelitian dasar',
        ]);
    }

    /**
     * Test: Membuat skema tanpa deskripsi (deskripsi opsional) berhasil
     */
    public function test_create_schema_without_description_succeeds(): void
    {
        // Arrange: Data tanpa deskripsi
        $data = ['name' => 'PDUPT'];

        // Act: Submit
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), $data);

        // Assert: Berhasil
        $response->assertRedirect(route('admin.schema.index'));
        $this->assertDatabaseHas('research_schemas', ['name' => 'PDUPT', 'description' => null]);
    }

    /**
     * Test: Validasi - nama skema wajib diisi
     */
    public function test_store_validates_name_is_required(): void
    {
        // Act: Submit tanpa nama
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), ['name' => '']);

        // Assert: Error validasi pada field name
        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test: Validasi - nama skema harus unik
     */
    public function test_store_validates_name_is_unique(): void
    {
        // Arrange: Skema dengan nama yang sama sudah ada
        ResearchSchema::create(['name' => 'Penelitian Dasar']);

        // Act: Coba buat skema dengan nama yang sama
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), ['name' => 'Penelitian Dasar']);

        // Assert: Error validasi unique
        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test: Validasi - nama skema maksimal 255 karakter
     */
    public function test_store_validates_name_max_length(): void
    {
        // Act: Submit nama yang melebihi 255 karakter
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), ['name' => str_repeat('a', 256)]);

        // Assert: Error validasi max
        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test: Validasi - deskripsi maksimal 1000 karakter
     */
    public function test_store_validates_description_max_length(): void
    {
        // Act: Submit deskripsi yang melebihi 1000 karakter
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.schema.store'), [
                'name'        => 'Skema Valid',
                'description' => str_repeat('a', 1001),
            ]);

        // Assert: Error validasi max pada description
        $response->assertSessionHasErrors(['description']);
    }

    /**
     * Test: User biasa tidak dapat membuat skema
     */
    public function test_regular_user_cannot_create_schema(): void
    {
        // Act: User biasa mencoba submit
        $response = $this->actingAs($this->regularUser)
            ->post(route('admin.schema.store'), ['name' => 'Skema Baru']);

        // Assert: Ditolak
        $response->assertForbidden();
        $this->assertDatabaseMissing('research_schemas', ['name' => 'Skema Baru']);
    }

    // =========================================================================
    // EDIT & UPDATE
    // =========================================================================

    /**
     * Test: Super Admin dapat mengakses halaman edit skema
     */
    public function test_super_admin_can_access_edit_form(): void
    {
        // Arrange: Buat skema
        $schema = ResearchSchema::create(['name' => 'Penelitian Dasar', 'description' => 'Deskripsi']);

        // Act: Kunjungi halaman edit
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.schema.edit', $schema));

        // Assert: Halaman edit dimuat dengan data skema
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Schema/Edit')
                ->where('schema.id', $schema->id)
                ->where('schema.name', 'Penelitian Dasar')
                ->where('schema.description', 'Deskripsi')
            );
    }

    /**
     * Test: User biasa tidak dapat mengakses halaman edit skema
     */
    public function test_regular_user_cannot_access_edit_form(): void
    {
        // Arrange
        $schema = ResearchSchema::create(['name' => 'Penelitian Dasar']);

        // Act
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.schema.edit', $schema));

        // Assert
        $response->assertForbidden();
    }

    /**
     * Test: Super Admin dapat memperbarui skema penelitian
     */
    public function test_super_admin_can_update_schema(): void
    {
        // Arrange: Buat skema dan data update
        $schema = ResearchSchema::create(['name' => 'Penelitian Dasar', 'description' => 'Deskripsi Lama']);

        $data = [
            'name'        => 'Penelitian Dasar (Diperbarui)',
            'description' => 'Deskripsi Baru',
        ];

        // Act: Submit update
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.schema.update', $schema), $data);

        // Assert: Redirect ke index dengan pesan sukses
        $response->assertRedirect(route('admin.schema.index'))
            ->assertSessionHas('success', "Skema Penelitian 'Penelitian Dasar (Diperbarui)' berhasil diperbarui.");

        // Assert: Data terupdate di database
        $this->assertDatabaseHas('research_schemas', [
            'id'          => $schema->id,
            'name'        => 'Penelitian Dasar (Diperbarui)',
            'description' => 'Deskripsi Baru',
        ]);
    }

    /**
     * Test: Update nama skema boleh memakai nama yang sama (milik dirinya sendiri)
     */
    public function test_update_schema_allows_same_name_for_current_record(): void
    {
        // Arrange: Buat skema
        $schema = ResearchSchema::create(['name' => 'Penelitian Dasar', 'description' => 'Deskripsi']);

        // Act: Update dengan nama yang sama
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.schema.update', $schema), [
                'name'        => 'Penelitian Dasar', // Nama sama, bukan duplikat
                'description' => 'Deskripsi Diperbarui',
            ]);

        // Assert: Berhasil tanpa error unique
        $response->assertRedirect(route('admin.schema.index'));
        $this->assertDatabaseHas('research_schemas', [
            'id'          => $schema->id,
            'description' => 'Deskripsi Diperbarui',
        ]);
    }

    /**
     * Test: Validasi - nama skema harus unik saat update (terhadap skema lain)
     */
    public function test_update_validates_name_unique_against_other_records(): void
    {
        // Arrange: Buat dua skema
        $schema1 = ResearchSchema::create(['name' => 'Skema A']);
        $schema2 = ResearchSchema::create(['name' => 'Skema B']);

        // Act: Coba update Skema B dengan nama Skema A
        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.schema.update', $schema2), ['name' => 'Skema A']);

        // Assert: Error validasi unique
        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test: User biasa tidak dapat memperbarui skema
     */
    public function test_regular_user_cannot_update_schema(): void
    {
        // Arrange
        $schema = ResearchSchema::create(['name' => 'Penelitian Dasar']);

        // Act
        $response = $this->actingAs($this->regularUser)
            ->put(route('admin.schema.update', $schema), ['name' => 'Diubah']);

        // Assert
        $response->assertForbidden();
        $this->assertDatabaseMissing('research_schemas', ['name' => 'Diubah']);
    }

    // =========================================================================
    // DESTROY
    // =========================================================================

    /**
     * Test: Super Admin dapat menghapus skema tanpa proposal
     */
    public function test_super_admin_can_delete_schema_without_proposals(): void
    {
        // Arrange: Buat skema tanpa proposal
        $schema = ResearchSchema::create(['name' => 'Skema Kosong']);

        // Act: Hapus skema
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.schema.destroy', $schema));

        // Assert: Redirect ke index dengan pesan sukses
        $response->assertRedirect(route('admin.schema.index'))
            ->assertSessionHas('success', "Skema Penelitian 'Skema Kosong' berhasil dihapus.");

        // Assert: Data terhapus dari database
        $this->assertDatabaseMissing('research_schemas', ['id' => $schema->id]);
    }

    /**
     * Test: Skema yang memiliki proposal tidak dapat dihapus
     */
    public function test_cannot_delete_schema_with_associated_proposals(): void
    {
        // Arrange: Buat skema dengan proposal terkait
        $schema = ResearchSchema::create(['name' => 'Skema Dengan Proposal']);

        Proposal::create([
            'research_schema_id' => $schema->id,
            'user_id'            => $this->superAdmin->id,
            'title'              => 'Proposal Test',
            'status'             => 'draft',
        ]);

        // Act: Coba hapus skema
        $response = $this->actingAs($this->superAdmin)
            ->delete(route('admin.schema.destroy', $schema));

        // Assert: Penghapusan dicegah dengan pesan error
        $response->assertForbidden();

        // Assert: Skema masih ada di database
        $this->assertDatabaseHas('research_schemas', ['id' => $schema->id]);
    }

    /**
     * Test: User biasa tidak dapat menghapus skema
     */
    public function test_regular_user_cannot_delete_schema(): void
    {
        // Arrange
        $schema = ResearchSchema::create(['name' => 'Skema Test']);

        // Act
        $response = $this->actingAs($this->regularUser)
            ->delete(route('admin.schema.destroy', $schema));

        // Assert
        $response->assertForbidden();
        $this->assertDatabaseHas('research_schemas', ['id' => $schema->id]);
    }

    /**
     * Test: Tamu tidak dapat menghapus skema
     */
    public function test_guest_cannot_delete_schema(): void
    {
        // Arrange
        $schema = ResearchSchema::create(['name' => 'Skema Test']);

        // Act
        $response = $this->delete(route('admin.schema.destroy', $schema));

        // Assert: Diarahkan ke halaman login
        $response->assertRedirect(route('login'));
        $this->assertDatabaseHas('research_schemas', ['id' => $schema->id]);
    }
}
