<?php

/**
 * Feature tests for Admin Proposal verification workflow.
 *
 * Covers:
 * - Super Admin dapat melihat daftar semua proposal
 * - Super Admin dapat memvalidasi (approve) proposal berstatus Submitted
 * - Super Admin dapat menolak (reject) proposal berstatus Submitted dengan alasan
 * - Menolak proposal tanpa alasan → 422 Validation Error
 * - Non-Super Admin (User biasa) tidak dapat mengakses halaman Admin Proposal
 * - Non-Super Admin tidak dapat melakukan approve/reject
 */

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();
});

// ─── Helper: buat proposal dengan status tertentu ─────────────────────────────

function createProposalWithStatus(string $status): Proposal
{
    // Buat ResearchSchema minimal (tidak ada factory, create langsung)
    $schema = ResearchSchema::create([
        'name'        => 'Skema Penelitian Dasar',
        'description' => 'Penelitian dasar oleh Dosen',
    ]);

    $user = User::factory()->user()->create();

    return Proposal::create([
        'title'              => 'Proposal Uji Coba ' . $status,
        'description'        => 'Deskripsi proposal untuk keperluan pengujian.',
        'user_id'            => $user->id,
        'research_schema_id' => $schema->id,
        'status_proposal'    => $status,
    ]);
}

// ─── Index Tests ──────────────────────────────────────────────────────────────

it('super admin dapat melihat daftar semua proposal', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    createProposalWithStatus(Proposal::STATUS_SUBMITTED);
    createProposalWithStatus(Proposal::STATUS_DRAFT);

    $response = $this
        ->actingAs($superAdmin)
        ->get(route('admin.proposals.index'));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('Admin/Proposals/Index')
                ->has('proposals.data', 2)
        );
});

it('super admin dapat memfilter proposal berdasarkan status', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    createProposalWithStatus(Proposal::STATUS_SUBMITTED);
    createProposalWithStatus(Proposal::STATUS_DRAFT);

    $response = $this
        ->actingAs($superAdmin)
        ->get(route('admin.proposals.index', ['status' => Proposal::STATUS_SUBMITTED]));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('Admin/Proposals/Index')
                ->has('proposals.data', 1)
        );
});

it('user biasa tidak dapat mengakses halaman admin proposal', function () {
    $user = User::factory()->user()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('admin.proposals.index'));

    $response->assertStatus(403);
});

// ─── Approve Tests ────────────────────────────────────────────────────────────

it('super admin dapat memvalidasi proposal berstatus Submitted', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $response = $this
        ->actingAs($superAdmin)
        ->post(route('admin.proposals.approve', $proposal));

    $response->assertRedirect(route('admin.proposals.index'))
        ->assertSessionHas('success');

    expect($proposal->fresh()->status_proposal)
        ->toBe(Proposal::STATUS_ADMINISTRASI_VALID);

    expect($proposal->fresh()->rejection_reason)
        ->toBeNull();
});

it('super admin tidak dapat memvalidasi proposal berstatus Draft', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_DRAFT);

    $response = $this
        ->actingAs($superAdmin)
        ->post(route('admin.proposals.approve', $proposal));

    $response->assertStatus(403);

    expect($proposal->fresh()->status_proposal)
        ->toBe(Proposal::STATUS_DRAFT);
});

it('user biasa tidak dapat memvalidasi proposal', function () {
    $user     = User::factory()->user()->create();
    $proposal = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $this->actingAs($user)
        ->post(route('admin.proposals.approve', $proposal))
        ->assertStatus(403);
});

// ─── Reject Tests ─────────────────────────────────────────────────────────────

it('super admin dapat menolak proposal berstatus Submitted dengan alasan', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $reason = 'Proposal ini tidak memenuhi syarat administrasi yang ditentukan.';

    $response = $this
        ->actingAs($superAdmin)
        ->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => $reason,
        ]);

    $response->assertRedirect(route('admin.proposals.index'))
        ->assertSessionHas('success');

    expect($proposal->fresh()->status_proposal)->toBe(Proposal::STATUS_DITOLAK);
    expect($proposal->fresh()->rejection_reason)->toBe($reason);
});

it('menolak proposal tanpa alasan menghasilkan error validasi 422', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $this->actingAs($superAdmin)
        ->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors(['rejection_reason']);

    // Status tidak berubah
    expect($proposal->fresh()->status_proposal)->toBe(Proposal::STATUS_SUBMITTED);
});

it('menolak proposal dengan alasan terlalu pendek menghasilkan error validasi', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $this->actingAs($superAdmin)
        ->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => 'Kurang',
        ])
        ->assertSessionHasErrors(['rejection_reason']);
});

it('super admin tidak dapat menolak proposal berstatus Draft', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $proposal   = createProposalWithStatus(Proposal::STATUS_DRAFT);

    $this->actingAs($superAdmin)
        ->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => 'Alasan penolakan yang cukup panjang untuk validasi.',
        ])
        ->assertStatus(403);
});

it('user biasa tidak dapat menolak proposal', function () {
    $user     = User::factory()->user()->create();
    $proposal = createProposalWithStatus(Proposal::STATUS_SUBMITTED);

    $this->actingAs($user)
        ->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => 'Alasan penolakan yang cukup panjang untuk validasi.',
        ])
        ->assertStatus(403);
});
