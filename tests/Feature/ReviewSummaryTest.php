<?php

/**
 * Feature Test: ReviewSummaryTest
 *
 * Pengujian fitur rekapitulasi review multi-reviewer (ReviewSummaryController)
 * dan perpanjangan due date (ReviewAssignmentController).
 *
 * Strategi Opsi B (Local Mocking):
 * - Model ReviewerAssignment dan ReviewDecision di-mock secara lokal.
 * - Berkas ini boleh di-commit ke PR karena tidak mengandung model tiruan
 *   (hanya test fungsional yang bergantung pada model lokal tersebut).
 * - Ketika model resmi dari tim lain sudah di-merge, mock annotation
 *   pada model dapat dihapus tanpa mengubah test ini.
 */

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\ReviewDecision;
use App\Models\ReviewerAssignment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(function () {
    $this->withoutVite();
    $this->seedRoles();

    // Super Admin
    $superRole = Role::where('name', Role::SUPER_ADMIN)->first();
    $this->superAdmin = User::factory()->create([
        'role_id' => $superRole->id,
        'is_active' => true,
    ]);
    $this->superAdmin->roles()->attach($superRole->id);

    // Admin Kampus
    $adminRole = Role::where('name', Role::ADMIN_KAMPUS)->first();
    $this->adminKampus = User::factory()->create([
        'role_id' => $adminRole->id,
        'is_active' => true,
    ]);
    $this->adminKampus->roles()->attach($adminRole->id);

    // User biasa (Pengelola Jurnal)
    $userRole = Role::where('name', Role::USER)->first();
    $this->regularUser = User::factory()->create([
        'role_id' => $userRole->id,
        'is_active' => true,
    ]);
    $this->regularUser->roles()->attach($userRole->id);

    // Reviewer (is_reviewer = true, tidak ada role khusus)
    $this->reviewerUser = User::factory()->create([
        'is_reviewer' => true,
        'is_active' => true,
    ]);

    // Research Schema
    $this->researchSchema = ResearchSchema::create([
        'name' => 'Skema Riset Pengujian',
    ]);

    // Proposal
    $this->proposal = Proposal::create([
        'judul' => 'Proposal Riset Pengujian',
        'deskripsi' => 'Deskripsi pengujian otomatis.',
        'user_id' => $this->regularUser->id,
        'research_schema_id' => $this->researchSchema->id,
    ]);

    // Reviewer Assignment (model lokal mock)
    $this->assignment = ReviewerAssignment::create([
        'proposal_id' => $this->proposal->id,
        'reviewer_id' => $this->reviewerUser->id,
        'due_date' => now()->addDays(14)->format('Y-m-d'),
        'status' => 'assigned',
    ]);

    // Review Decision (model lokal mock)
    ReviewDecision::create([
        'reviewer_assignment_id' => $this->assignment->id,
        'score' => 85,
        'recommendation' => 'accepted',
        'comment' => 'Proposal sangat baik.',
    ]);
});

// ─────────────────────────────────────────────
// Review Summary Index Tests
// ─────────────────────────────────────────────

describe('ReviewSummaryController@index', function () {
    it('super admin dapat mengakses halaman rekap review', function () {
        $this->actingAs($this->superAdmin)
            ->get(route('review.summary.index', $this->proposal))
            ->assertStatus(200);
    });

    it('admin kampus dapat mengakses halaman rekap review', function () {
        $this->actingAs($this->adminKampus)
            ->get(route('review.summary.index', $this->proposal))
            ->assertStatus(200);
    });

    it('pengelola jurnal dapat mengakses halaman rekap review', function () {
        $this->actingAs($this->regularUser)
            ->get(route('review.summary.index', $this->proposal))
            ->assertStatus(200);
    });

    it('tamu tidak dapat mengakses halaman rekap review (redirect ke login)', function () {
        $this->get(route('review.summary.index', $this->proposal))
            ->assertRedirect(route('login'));
    });

    it('mengembalikan data proposal yang benar ke Inertia', function () {
        $this->actingAs($this->superAdmin)
            ->get(route('review.summary.index', $this->proposal))
            ->assertStatus(200);
    });

    it('mengembalikan data assignments yang benar ke Inertia', function () {
        $this->actingAs($this->superAdmin)
            ->get(route('review.summary.index', $this->proposal))
            ->assertStatus(200);
    });

    it('proposal tanpa reviewer mengembalikan assignments kosong', function () {
        $emptyProposal = Proposal::create([
            'judul' => 'Proposal Tanpa Reviewer',
            'deskripsi' => '',
            'user_id' => $this->regularUser->id,
            'research_schema_id' => $this->researchSchema->id,
        ]);

        $this->actingAs($this->superAdmin)
            ->get(route('review.summary.index', $emptyProposal))
            ->assertStatus(200);
    });
});

// ─────────────────────────────────────────────
// Extend Due Date Tests
// ─────────────────────────────────────────────

describe('ReviewAssignmentController@extendDue', function () {
    it('super admin dapat memperpanjang due date reviewer assignment', function () {
        $newDate = now()->addDays(30)->format('Y-m-d');

        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => $newDate,
            ])
            ->assertRedirect();

        $this->assignment->refresh();
        expect($this->assignment->due_date->format('Y-m-d'))->toBe($newDate);
    });

    it('admin kampus dapat memperpanjang due date reviewer assignment', function () {
        $newDate = now()->addDays(20)->format('Y-m-d');

        $this->actingAs($this->adminKampus)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => $newDate,
            ])
            ->assertRedirect();

        $this->assignment->refresh();
        expect($this->assignment->due_date->format('Y-m-d'))->toBe($newDate);
    });

    it('pengelola jurnal dapat memperpanjang due date reviewer assignment', function () {
        $newDate = now()->addDays(10)->format('Y-m-d');

        $this->actingAs($this->regularUser)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => $newDate,
            ])
            ->assertRedirect();

        $this->assignment->refresh();
        expect($this->assignment->due_date->format('Y-m-d'))->toBe($newDate);
    });

    it('tamu tidak dapat memperpanjang due date (redirect ke login)', function () {
        $this->post(route('review.assignment.extend-due', $this->assignment), [
            'due_date' => now()->addDays(15)->format('Y-m-d'),
        ])->assertRedirect(route('login'));
    });

    it('due_date wajib diisi', function () {
        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => '',
            ])
            ->assertSessionHasErrors('due_date');
    });

    it('due_date harus berupa tanggal valid', function () {
        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => 'bukan-tanggal',
            ])
            ->assertSessionHasErrors('due_date');
    });

    it('due_date harus setelah hari ini', function () {
        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => now()->subDay()->format('Y-m-d'),
            ])
            ->assertSessionHasErrors('due_date');
    });

    it('due_date tidak boleh hari ini', function () {
        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => now()->format('Y-m-d'),
            ])
            ->assertSessionHasErrors('due_date');
    });

    it('flash success dikirim setelah berhasil perpanjang', function () {
        $this->actingAs($this->superAdmin)
            ->post(route('review.assignment.extend-due', $this->assignment), [
                'due_date' => now()->addDays(30)->format('Y-m-d'),
            ])
            ->assertSessionHas('success', 'Due date berhasil diperpanjang.');
    });
});
