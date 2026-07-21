<?php

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;

/**
 * Helper: Data komponen_penilaian rubrik untuk testing
 */
function sampleKomponenPenilaian(int $skor = 4): array
{
    return [
        ['kriteria' => 'Orisinalitas & Kebaruan', 'bobot' => 20, 'skor' => $skor],
        ['kriteria' => 'Tinjauan Pustaka', 'bobot' => 15, 'skor' => $skor],
        ['kriteria' => 'Metodologi Penelitian', 'bobot' => 25, 'skor' => $skor],
        ['kriteria' => 'Luaran & Dampak', 'bobot' => 20, 'skor' => $skor],
        ['kriteria' => 'Kelayakan Anggaran', 'bobot' => 20, 'skor' => $skor],
    ];
}

describe('ReviewController', function () {
    beforeEach(function () {
        // Pastikan role Reviewer dan User ada di database
        $this->reviewerRole = Role::firstOrCreate(
            ['name' => Role::REVIEWER],
            ['display_name' => 'Reviewer', 'description' => 'Reviewer proposal']
        );

        $this->userRole = Role::firstOrCreate(
            ['name' => Role::USER],
            ['display_name' => 'User', 'description' => 'Regular user']
        );

        // Pastikan ResearchSchema ada (dibutuhkan oleh ProposalFactory FK)
        $this->researchSchema = ResearchSchema::firstOrCreate(
            ['name' => 'Skema Penelitian Dasar'],
            ['description' => 'Skema penelitian dasar untuk testing']
        );
    });

    /**
     * Helper: buat user dengan role Reviewer
     */
    function createReviewerUser(): User
    {
        $role = Role::where('name', Role::REVIEWER)->first();
        $user = User::factory()->create(['role_id' => $role->id]);
        $user->roles()->attach($role->id);

        return $user;
    }

    /**
     * Helper: buat user dengan role User (non-reviewer)
     */
    function createRegularUser(): User
    {
        $role = Role::where('name', Role::USER)->first();

        return User::factory()->create(['role_id' => $role->id]);
    }

    /**
     * Helper: buat proposal dengan FK yang valid
     */
    function createProposal(): Proposal
    {
        $user = User::factory()->create();
        $schema = ResearchSchema::first();

        return Proposal::factory()->create([
            'user_id' => $user->id,
            'research_schema_id' => $schema->id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store Assessment Tests
    |--------------------------------------------------------------------------
    */

    it('allows a reviewer to store a new assessment', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(4),
            'score' => 80,
            'comments' => 'Proposal ini sangat baik dan memenuhi kriteria.',
            'recommendation' => 'accepted',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 80,
            'recommendation' => 'accepted',
        ]);
    });

    it('rejects assessment from a non-reviewer user', function () {
        $user = createRegularUser();
        $proposal = createProposal();

        $response = $this->actingAs($user)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(4),
            'score' => 80,
            'comments' => 'Seharusnya tidak bisa.',
            'recommendation' => 'accepted',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('reviews', [
            'proposal_id' => $proposal->id,
        ]);
    });

    it('validates required fields when storing assessment', function () {
        $reviewer = createReviewerUser();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), []);

        $response->assertSessionHasErrors(['proposal_id', 'komponen_penilaian', 'score', 'recommendation']);
    });

    it('validates score must be between 0 and 100', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(4),
            'score' => 150,
            'recommendation' => 'accepted',
        ]);

        $response->assertSessionHasErrors(['score']);
    });

    it('validates recommendation must be a valid value', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(4),
            'score' => 70,
            'recommendation' => 'invalid_value',
        ]);

        $response->assertSessionHasErrors(['recommendation']);
    });

    it('validates komponen_penilaian skor must be between 1 and 5', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => [
                ['kriteria' => 'Orisinalitas & Kebaruan', 'bobot' => 20, 'skor' => 6],
            ],
            'score' => 70,
            'recommendation' => 'accepted',
        ]);

        $response->assertSessionHasErrors(['komponen_penilaian.0.skor']);
    });

    it('requires comments when recommendation is revision or rejected', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $response = $this->actingAs($reviewer)->post(route('reviewer.assessment.store'), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(3),
            'score' => 60,
            'comments' => '',
            'recommendation' => 'rejected',
        ]);

        $response->assertSessionHasErrors(['comments']);
    });

    /*
    |--------------------------------------------------------------------------
    | Update Assessment Tests
    |--------------------------------------------------------------------------
    */

    it('allows a reviewer to update their own assessment', function () {
        $reviewer = createReviewerUser();
        $proposal = createProposal();

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'komponen_penilaian' => sampleKomponenPenilaian(3),
            'score' => 60,
            'comments' => 'Perlu perbaikan.',
            'recommendation' => 'revision',
        ]);

        $response = $this->actingAs($reviewer)->put(route('reviewer.assessment.update', $review->id), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(4),
            'score' => 80,
            'comments' => 'Sudah diperbaiki, layak diterima.',
            'recommendation' => 'accepted',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'score' => 80,
            'recommendation' => 'accepted',
        ]);
    });

    it('prevents a reviewer from updating another reviewer assessment', function () {
        $reviewer1 = createReviewerUser();
        $reviewer2 = createReviewerUser();
        $proposal = createProposal();

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer1->id,
            'komponen_penilaian' => sampleKomponenPenilaian(3),
            'score' => 60,
            'comments' => 'Milik reviewer 1.',
            'recommendation' => 'revision',
        ]);

        $response = $this->actingAs($reviewer2)->put(route('reviewer.assessment.update', $review->id), [
            'proposal_id' => $proposal->id,
            'komponen_penilaian' => sampleKomponenPenilaian(5),
            'score' => 90,
            'comments' => 'Dicoba ubah oleh reviewer 2.',
            'recommendation' => 'accepted',
        ]);

        $response->assertForbidden();

        // Pastikan data tidak berubah
        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'score' => 60,
            'recommendation' => 'revision',
        ]);
    });
});
