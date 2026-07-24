<?php

/**
 * ContractController Feature Tests
 *
 * Verifies the full contract lifecycle:
 *   - generate()     → create draft, auto contract number, redirect
 *   - show()         → detail page, multi-tenancy guard
 *   - updateStatus() → valid/invalid transitions, terminal state guard, multi-tenancy
 *
 * Test isolation: RefreshDatabase is applied per test (via Pest.php configuration).
 *
 * Conventions follow the project standard established in AccreditationTemplateControllerTest.php:
 *   - beforeEach seeds roles and creates typed users
 *   - Named routes use 'admin.*' prefix
 *   - assertInertia for Inertia.js page assertions
 *
 * @author GILANG JA'FAR PRASETYA
 */

use App\Models\Contract;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

// ─── Test Setup ───────────────────────────────────────────────────────────────

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);

    $this->university = University::factory()->create();

    // Super Admin — can access any contract
    $this->superAdmin = User::factory()->create([
        'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
        'university_id' => $this->university->id,
        'is_active' => true,
    ]);

    // Admin Kampus — should be blocked (non-super-admin)
    $this->adminKampus = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->first()->id,
        'university_id' => $this->university->id,
        'is_active' => true,
    ]);
});

// ============================================================================
// generate() — CREATE DRAFT CONTRACT
// ============================================================================

test('Super Admin can create a draft contract', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Kontrak Riset Jurnal Nasional 2026',
            'university_id' => $this->university->id,
            'start_date' => '2026-06-01',
            'end_date' => '2026-12-31',
            'contract_value' => 150_000_000,
        ])
        ->assertRedirect();

    assertDatabaseHas('contracts', [
        'title' => 'Kontrak Riset Jurnal Nasional 2026',
        'status' => 'draft',
        'university_id' => $this->university->id,
        'contract_value' => 150_000_000,
    ]);
});

test('generated contract has a properly formatted contract number', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Kontrak Bernomor',
        ]);

    $contract = Contract::where('title', 'Kontrak Bernomor')->first();

    expect($contract)->not->toBeNull();
    expect($contract->contract_number)->toMatch('/^KON-\d{4}-\d{4}$/');
});

test('generate redirects to admin.contracts.show after creation', function () {
    $response = actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Kontrak Redirect Test',
        ]);

    $contract = Contract::where('title', 'Kontrak Redirect Test')->first();

    $response->assertRedirect(route('admin.contracts.show', $contract));
});

test('generate sets created_by to the acting user', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Kontrak Audit Trail',
        ]);

    assertDatabaseHas('contracts', [
        'title' => 'Kontrak Audit Trail',
        'created_by' => $this->superAdmin->id,
    ]);
});

test('generate requires title field', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'university_id' => $this->university->id,
        ])
        ->assertSessionHasErrors('title');
});

test('generate rejects end_date before start_date', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Tanggal Salah',
            'start_date' => '2026-12-31',
            'end_date' => '2026-06-01',
        ])
        ->assertSessionHasErrors('end_date');
});

test('Non-Super Admin cannot create a contract', function () {
    actingAs($this->adminKampus)
        ->post(route('admin.contracts.generate'), [
            'title' => 'Unauthorized Contract',
        ])
        ->assertForbidden();
});

// ============================================================================
// show() — CONTRACT DETAIL PAGE
// ============================================================================

test('Super Admin can view contract detail page', function () {
    $contract = Contract::factory()->create([
        'university_id' => $this->university->id,
        'created_by' => $this->superAdmin->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.contracts.show', $contract))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Finance/Contract/Show')
            ->has('contract')
            ->where('contract.id', $contract->id)
        );
});

test('Non-Super Admin cannot view contract detail page', function () {
    $contract = Contract::factory()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->adminKampus)
        ->get(route('admin.contracts.show', $contract))
        ->assertForbidden();
});

test('show page exposes contract financial data', function () {
    $contract = Contract::factory()->withValue(200_000_000)->create([
        'university_id' => $this->university->id,
        'created_by' => $this->superAdmin->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.contracts.show', $contract))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('contract.contract_value', 200_000_000)
        );
});

// ============================================================================
// updateStatus() — STATUS TRANSITIONS
// ============================================================================

test('Super Admin can activate a draft contract', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'active',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($contract->fresh()->status)->toBe('active');
});

test('Super Admin can mark an active contract as selesai', function () {
    $contract = Contract::factory()->active()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'selesai',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($contract->fresh()->status)->toBe('selesai');
});

test('Super Admin can cancel a draft contract', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'dibatalkan',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($contract->fresh()->status)->toBe('dibatalkan');
});

test('draft contract cannot jump directly to selesai (invalid transition)', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'selesai',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($contract->fresh()->status)->toBe('draft');
});

test('selesai contract cannot be transitioned (terminal state)', function () {
    $contract = Contract::factory()->selesai()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'active',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($contract->fresh()->status)->toBe('selesai');
});

test('dibatalkan contract cannot be transitioned (terminal state)', function () {
    $contract = Contract::factory()->dibatalkan()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'active',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($contract->fresh()->status)->toBe('dibatalkan');
});

test('updateStatus requires a valid status value', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'invalid_status',
        ])
        ->assertSessionHasErrors('status');
});

test('Non-Super Admin cannot update contract status', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->adminKampus)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'active',
        ])
        ->assertForbidden();

    expect($contract->fresh()->status)->toBe('draft');
});

test('updateStatus records updated_by for audit trail', function () {
    $contract = Contract::factory()->draft()->create([
        'university_id' => $this->university->id,
    ]);

    actingAs($this->superAdmin)
        ->post(route('admin.contracts.update-status', $contract), [
            'status' => 'active',
        ]);

    expect($contract->fresh()->updated_by)->toBe($this->superAdmin->id);
});
