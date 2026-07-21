<?php

use App\Models\ResearchOutput;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    // Create roles
    $this->userRole = Role::create([
        'name'         => 'User',
        'display_name' => 'User',
    ]);
    $this->superAdminRole = Role::create([
        'name'         => 'Super Admin',
        'display_name' => 'Super Admin',
    ]);

    // Create university
    $this->university = University::create([
        'name'      => 'Universitas Test',
        'code'      => 'UTEST',
        'address'   => 'Jl. Test No. 1',
        'city'      => 'Kota Test',
        'province'  => 'Provinsi Test',
        'is_active' => true,
    ]);

    // Create a regular user (Pengelola Jurnal)
    $this->user = User::factory()->create([
        'university_id'    => $this->university->id,
        'is_active'        => true,
        'approval_status'  => 'approved',
    ]);
    $this->user->roles()->attach($this->userRole);

    // Create a second user (other user, to test ownership isolation)
    $this->otherUser = User::factory()->create([
        'university_id'   => $this->university->id,
        'is_active'       => true,
        'approval_status' => 'approved',
    ]);
    $this->otherUser->roles()->attach($this->userRole);

    // Create a Super Admin
    $this->superAdmin = User::factory()->create([
        'university_id'   => $this->university->id,
        'is_active'       => true,
        'approval_status' => 'approved',
    ]);
    $this->superAdmin->roles()->attach($this->superAdminRole);
});

// ─────────────────────────────────────────────────────────────────────────────
// storeProduct — POST /user/outputs/products
// ─────────────────────────────────────────────────────────────────────────────

it('allows an authenticated user to store a product output', function () {
    $this->actingAs($this->user)
        ->post(route('user.outputs.products.store'), [
            'title'       => 'Prototipe Robot',
            'description' => 'Deskripsi prototipe robot',
            'tkt_level'   => 5,
            'year'        => date('Y'),
            'status'      => 'draft',
            'category'    => 'produk',
        ])
        ->assertRedirect(route('user.outputs.index'));

    $this->assertDatabaseHas('outputs', [
        'user_id'  => $this->user->id,   // RBAC: selalu dari login
        'judul'    => 'Prototipe Robot',
        'kategori' => 'produk',
        'status'   => 'draft',
        'tkt_level' => 5,
    ]);
});

it('always binds user_id to the authenticated user, ignoring any injected user_id', function () {
    $this->actingAs($this->user)
        ->post(route('user.outputs.products.store'), [
            'title'       => 'Prototipe Injeksi',
            'description' => 'Deskripsi',
            'tkt_level'   => 3,
            'year'        => date('Y'),
            'status'      => 'draft',
            'category'    => 'produk',
            // Attempt to inject another user's ID — must be ignored
            'user_id'     => $this->otherUser->id,
        ])
        ->assertRedirect(route('user.outputs.index'));

    $output = ResearchOutput::where('judul', 'Prototipe Injeksi')->first();
    expect($output->user_id)->toBe($this->user->id);
});

it('stores cover image and saves path to database', function () {
    $cover = UploadedFile::fake()->image('cover.jpg', 800, 600);

    $this->actingAs($this->user)
        ->post(route('user.outputs.products.store'), [
            'title'       => 'Prototipe dengan Cover',
            'description' => 'Deskripsi',
            'tkt_level'   => 7,
            'year'        => date('Y'),
            'status'      => 'draft',
            'category'    => 'produk',
            'cover_image' => $cover,
        ])
        ->assertRedirect(route('user.outputs.index'));

    $output = ResearchOutput::where('judul', 'Prototipe dengan Cover')->first();
    expect($output)->not->toBeNull();
    expect($output->cover_image)->not->toBeNull();
    Storage::disk('public')->assertExists($output->cover_image);
});

it('stores document and saves path to database', function () {
    $doc = UploadedFile::fake()->create('bukti.pdf', 1024, 'application/pdf');

    $this->actingAs($this->user)
        ->post(route('user.outputs.products.store'), [
            'title'       => 'Prototipe dengan Dokumen',
            'description' => 'Deskripsi',
            'tkt_level'   => 6,
            'year'        => date('Y'),
            'status'      => 'draft',
            'category'    => 'produk',
            'document'    => $doc,
        ])
        ->assertRedirect(route('user.outputs.index'));

    $output = ResearchOutput::where('judul', 'Prototipe dengan Dokumen')->first();
    expect($output)->not->toBeNull();
    expect($output->document)->not->toBeNull();
    Storage::disk('public')->assertExists($output->document);
});

it('rejects store when required fields are missing', function () {
    $this->actingAs($this->user)
        ->post(route('user.outputs.products.store'), [])
        ->assertSessionHasErrors(['title', 'description', 'tkt_level', 'year', 'status', 'category']);
});

it('redirects guest to login when storing a product', function () {
    $this->post(route('user.outputs.products.store'), [
        'title'    => 'Produk',
        'tkt_level' => 3,
    ])->assertRedirect(route('login'));
});

// ─────────────────────────────────────────────────────────────────────────────
// update — PUT /user/outputs/{output}
// ─────────────────────────────────────────────────────────────────────────────

it('allows owner to update their own output', function () {
    $output = ResearchOutput::create([
        'user_id'  => $this->user->id,
        'kategori' => 'produk',
        'judul'    => 'Output Lama',
        'status'   => 'draft',
        'tkt_level' => 3,
        'year'     => date('Y'),
    ]);

    $this->actingAs($this->user)
        ->put(route('user.outputs.update', $output), [
            'kategori'  => 'produk',
            'judul'     => 'Output Diperbarui',
            'status'    => 'draft',
            'tkt_level' => 5,
            'year'      => date('Y'),
        ])
        ->assertRedirect(route('user.outputs.index'));

    $this->assertDatabaseHas('outputs', [
        'id'        => $output->id,
        'judul'     => 'Output Diperbarui',
        'tkt_level' => 5,
    ]);
});

it('forbids another user from updating someone else\'s output (403)', function () {
    $output = ResearchOutput::create([
        'user_id'  => $this->user->id,
        'kategori' => 'produk',
        'judul'    => 'Output Orang Lain',
        'status'   => 'draft',
    ]);

    $this->actingAs($this->otherUser)
        ->put(route('user.outputs.update', $output), [
            'kategori' => 'produk',
            'judul'    => 'Coba Ubah',
            'status'   => 'draft',
        ])
        ->assertForbidden();
});

// ─────────────────────────────────────────────────────────────────────────────
// destroy — DELETE /user/outputs/{output}
// ─────────────────────────────────────────────────────────────────────────────

it('allows owner to delete their own draft output', function () {
    $output = ResearchOutput::create([
        'user_id'  => $this->user->id,
        'kategori' => 'produk',
        'judul'    => 'Output Akan Dihapus',
        'status'   => 'draft',
    ]);

    $this->actingAs($this->user)
        ->delete(route('user.outputs.destroy', $output))
        ->assertRedirect(route('user.outputs.index'));

    $this->assertDatabaseMissing('outputs', ['id' => $output->id]);
});

it('forbids non-owner from deleting another user\'s output (403)', function () {
    $output = ResearchOutput::create([
        'user_id'  => $this->user->id,
        'kategori' => 'produk',
        'judul'    => 'Output Protected',
        'status'   => 'draft',
    ]);

    $this->actingAs($this->otherUser)
        ->delete(route('user.outputs.destroy', $output))
        ->assertForbidden();
});

// ─────────────────────────────────────────────────────────────────────────────
// ResearchOutputPolicy — unit-level
// ─────────────────────────────────────────────────────────────────────────────

it('policy: owner can update their own output', function () {
    $output = ResearchOutput::make(['user_id' => $this->user->id, 'status' => 'draft']);
    $policy = new \App\Policies\ResearchOutputPolicy();
    expect($policy->update($this->user, $output))->toBeTrue();
});

it('policy: non-owner cannot update output', function () {
    $output = ResearchOutput::make(['user_id' => $this->user->id, 'status' => 'draft']);
    $policy = new \App\Policies\ResearchOutputPolicy();
    expect($policy->update($this->otherUser, $output))->toBeFalse();
});

it('policy: owner can delete their own draft output', function () {
    $output = ResearchOutput::make(['user_id' => $this->user->id, 'status' => 'draft']);
    $policy = new \App\Policies\ResearchOutputPolicy();
    expect($policy->delete($this->user, $output))->toBeTrue();
});

it('policy: owner cannot delete a non-draft output', function () {
    $output = ResearchOutput::make(['user_id' => $this->user->id, 'status' => 'submitted']);
    $policy = new \App\Policies\ResearchOutputPolicy();
    expect($policy->delete($this->user, $output))->toBeFalse();
});

it('policy: super admin can update any output', function () {
    $output = ResearchOutput::make(['user_id' => $this->user->id, 'status' => 'approved']);
    $policy = new \App\Policies\ResearchOutputPolicy();
    expect($policy->update($this->superAdmin, $output))->toBeTrue();
});
