<?php

/**
 * @file DashboardUserTest.php
 * @brief Feature tests for the User (Peneliti/Dosen) dashboard page.
 *
 * Verifies that the dashboard at GET /dashboard correctly renders the
 * `Dashboard/User` Inertia page and exposes the expected `proposal_stats`
 * props populated from the `proposals` table (Modul 1 – Manajemen Proposal
 * Penelitian) in accordance with Modul 6 – Dashboard dan Pelaporan of the
 * Sistem Penelitian Terintegrasi PRD for Kelas B.
 *
 * Test groups  : feature, dashboard, user
 * Database     : RefreshDatabase (via Pest.php)
 * Dependencies : App\Models\{User, University, Proposal, SkemaPendanaan}
 *
 * @group feature
 * @group dashboard
 * @group user
 *
 * @author  RPL-2026 Kelas B
 * @since   2026-07-19
 */

use App\Models\Proposal;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\DB;

uses()->group('feature', 'dashboard', 'user');

// ─────────────────────────────────────────────────────────────────────────────
// Shared setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(function () {
    $this->seedRoles();

    $this->university = University::factory()->create(['name' => 'Universitas Test']);

    // Create two researchers in the same university
    $this->researcher  = User::factory()->user()->create(['university_id' => $this->university->id]);
    $this->researcher2 = User::factory()->user()->create(['university_id' => $this->university->id]);
    $this->superAdmin  = User::factory()->superAdmin()->create();
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper – insert proposals directly via DB (no factory needed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a proposal row in the `proposals` table for the given researcher.
 *
 * @param  int     $userId          The `id_pengusul` (researcher user ID).
 * @param  string  $status          One of: draft, submitted, administrasi_valid, ditolak.
 * @param  float   $pendanaan       `total_pendanaan_disetujui` amount (IDR). Default 0.
 * @return int     Inserted proposal ID.
 */
function createProposal(int $userId, string $status = 'draft', float $pendanaan = 0): int
{
    return DB::table('proposals')->insertGetId([
        'id_pengusul'               => $userId,
        'id_skema_pendanaan'        => null,
        'judul_penelitian'          => fake()->sentence(5),
        'abstrak'                   => fake()->paragraph(),
        'latar_belakang'            => fake()->paragraph(),
        'file_dokumen_proposal'     => null,
        'status_proposal'           => $status,
        'tanggal_pengajuan'         => $status === 'submitted' ? now()->toDateString() : null,
        'total_pendanaan_disetujui' => $status === 'administrasi_valid' ? $pendanaan : null,
        'deleted_by'                => null,
        'created_at'                => now(),
        'updated_at'                => now(),
        'deleted_at'                => null,
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Access Control
// ─────────────────────────────────────────────────────────────────────────────

describe('Access Control', function () {
    test('unauthenticated user is redirected to login', function () {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    });

    test('User role can access the dashboard', function () {
        $response = $this->actingAs($this->researcher)->get('/dashboard');
        $response->assertOk();
    });

    test('dashboard renders the Dashboard/User Inertia component for User role', function () {
        $response = $this->actingAs($this->researcher)->get('/dashboard');
        $response->assertInertia(fn ($page) => $page->component('Dashboard/User'));
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Proposal Stats – Empty State
// ─────────────────────────────────────────────────────────────────────────────

describe('Empty Proposal State', function () {
    test('returns zero for all metrics when researcher has no proposals', function () {
        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.total',           0)
                ->where('proposal_stats.masuk',           0)
                ->where('proposal_stats.lolos',           0)
                ->where('proposal_stats.gagal',           0)
                ->where('proposal_stats.draft',           0)
                ->where('proposal_stats.success_rate',    0.0)
                ->where('proposal_stats.total_pendanaan', 0.0)
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Proposal Stats – Status Counts
// ─────────────────────────────────────────────────────────────────────────────

describe('Proposal Status Counts', function () {
    test('counts draft proposals correctly', function () {
        createProposal($this->researcher->id, 'draft');
        createProposal($this->researcher->id, 'draft');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.draft',  2)
                ->where('proposal_stats.total',  2)
                ->where('proposal_stats.masuk',  0)
                ->where('proposal_stats.lolos',  0)
                ->where('proposal_stats.gagal',  0)
        );
    });

    test('counts submitted (masuk) proposals correctly', function () {
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'submitted');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.masuk', 3)
                ->where('proposal_stats.total', 3)
        );
    });

    test('counts administrasi_valid (lolos) proposals correctly', function () {
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);
        createProposal($this->researcher->id, 'administrasi_valid', 75_000_000);

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.lolos', 2)
                ->where('proposal_stats.total', 2)
        );
    });

    test('counts ditolak (gagal) proposals correctly', function () {
        createProposal($this->researcher->id, 'ditolak');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.gagal', 1)
                ->where('proposal_stats.total', 1)
        );
    });

    test('counts total proposals across all statuses', function () {
        createProposal($this->researcher->id, 'draft');
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'administrasi_valid', 100_000_000);
        createProposal($this->researcher->id, 'ditolak');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->where('proposal_stats.total', 4)
                ->where('proposal_stats.draft', 1)
                ->where('proposal_stats.masuk', 1)
                ->where('proposal_stats.lolos', 1)
                ->where('proposal_stats.gagal', 1)
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Success Rate Calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('Success Rate Calculation', function () {
    test('success_rate is 0 when there are no decided proposals', function () {
        createProposal($this->researcher->id, 'draft');
        createProposal($this->researcher->id, 'submitted');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.success_rate', 0.0)
        );
    });

    test('calculates 100% success rate when all decided proposals are accepted', function () {
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.success_rate', 100.0)
        );
    });

    test('calculates 50% success rate correctly', function () {
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);
        createProposal($this->researcher->id, 'ditolak');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.success_rate', 50.0)
        );
    });

    test('success_rate rounds to 1 decimal place', function () {
        // 1 lolos out of 3 decided = 33.3%
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);
        createProposal($this->researcher->id, 'ditolak');
        createProposal($this->researcher->id, 'ditolak');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.success_rate', 33.3)
        );
    });

    test('draft and submitted proposals are excluded from success_rate calculation', function () {
        // Only administrasi_valid and ditolak count as "decided"
        createProposal($this->researcher->id, 'draft');
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);
        createProposal($this->researcher->id, 'ditolak');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        // 1 lolos / (1 lolos + 1 gagal) = 50%
        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.success_rate', 50.0)
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Funding (Pendanaan) Metrics
// ─────────────────────────────────────────────────────────────────────────────

describe('Funding Metrics', function () {
    test('total_pendanaan sums approved proposals correctly', function () {
        createProposal($this->researcher->id, 'administrasi_valid', 100_000_000);
        createProposal($this->researcher->id, 'administrasi_valid', 250_000_000);
        createProposal($this->researcher->id, 'administrasi_valid', 150_000_000);

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.total_pendanaan', 500_000_000.0)
        );
    });

    test('total_pendanaan excludes rejected proposals', function () {
        createProposal($this->researcher->id, 'administrasi_valid', 200_000_000);
        createProposal($this->researcher->id, 'ditolak');  // no funding

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.total_pendanaan', 200_000_000.0)
        );
    });

    test('total_pendanaan is 0.0 when no proposals are approved', function () {
        createProposal($this->researcher->id, 'submitted');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.total_pendanaan', 0.0)
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Data Isolation (Researcher sees only their own proposals)
// ─────────────────────────────────────────────────────────────────────────────

describe('Data Isolation', function () {
    test('researcher sees only their own proposals – not other researchers', function () {
        // researcher has 2 proposals
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'administrasi_valid', 50_000_000);

        // researcher2 has 5 proposals (should not be visible to researcher)
        for ($i = 0; $i < 5; $i++) {
            createProposal($this->researcher2->id, 'submitted');
        }

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.total', 2)
                ->where('proposal_stats.masuk', 1)
                ->where('proposal_stats.lolos', 1)
        );
    });

    test('soft-deleted proposals are excluded from counts', function () {
        // Create 3 proposals, then soft-delete one
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'submitted');
        $toDelete = createProposal($this->researcher->id, 'submitted');

        DB::table('proposals')
            ->where('id', $toDelete)
            ->update(['deleted_at' => now()]);

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        // Only 2 should be counted (soft-deleted one excluded)
        $response->assertInertia(fn ($page) =>
            $page->where('proposal_stats.total', 2)
                ->where('proposal_stats.masuk', 2)
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Response Structure
// ─────────────────────────────────────────────────────────────────────────────

describe('Response Structure', function () {
    test('proposal_stats contains all required keys', function () {
        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/User')
                ->has('proposal_stats.total')
                ->has('proposal_stats.masuk')
                ->has('proposal_stats.lolos')
                ->has('proposal_stats.gagal')
                ->has('proposal_stats.draft')
                ->has('proposal_stats.success_rate')
                ->has('proposal_stats.total_pendanaan')
        );
    });

    test('stats prop is present in the page props', function () {
        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $response->assertInertia(fn ($page) =>
            $page->has('stats')
        );
    });

    test('all numeric proposal_stats values are non-negative', function () {
        createProposal($this->researcher->id, 'submitted');

        $response = $this->actingAs($this->researcher)->get('/dashboard');

        $page       = $response->viewData('page');
        $stats      = $page['props']['proposal_stats'];

        expect($stats['total'])->toBeGreaterThanOrEqual(0);
        expect($stats['masuk'])->toBeGreaterThanOrEqual(0);
        expect($stats['lolos'])->toBeGreaterThanOrEqual(0);
        expect($stats['gagal'])->toBeGreaterThanOrEqual(0);
        expect($stats['draft'])->toBeGreaterThanOrEqual(0);
        expect($stats['success_rate'])->toBeGreaterThanOrEqual(0.0);
        expect($stats['total_pendanaan'])->toBeGreaterThanOrEqual(0.0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Super Admin Scope
// ─────────────────────────────────────────────────────────────────────────────

describe('Super Admin Scope', function () {
    test('Super Admin proposal_stats aggregates across all researchers', function () {
        // researcher: 2 proposals
        createProposal($this->researcher->id, 'submitted');
        createProposal($this->researcher->id, 'administrasi_valid', 100_000_000);

        // researcher2: 3 proposals
        createProposal($this->researcher2->id, 'submitted');
        createProposal($this->researcher2->id, 'submitted');
        createProposal($this->researcher2->id, 'ditolak');

        $response = $this->actingAs($this->superAdmin)->get('/dashboard');

        // Super Admin should see all 5 proposals aggregated
        $page  = $response->viewData('page');
        $stats = $page['props']['proposal_stats'];

        expect($stats['total'])->toBe(5);
        expect($stats['masuk'])->toBe(3);
        expect($stats['lolos'])->toBe(1);
        expect($stats['gagal'])->toBe(1);
        expect($stats['total_pendanaan'])->toBe(100_000_000.0);
    });
});
