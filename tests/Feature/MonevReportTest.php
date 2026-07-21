<?php

use App\Models\Proposal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seedRoles();

    // Create Universities
    $this->univA = University::factory()->create(['name' => 'Universitas A']);
    $this->univB = University::factory()->create(['name' => 'Universitas B']);

    // Create Roles
    $adminRole = Role::where('name', Role::ADMIN_KAMPUS)->first();
    $superRole = Role::where('name', Role::SUPER_ADMIN)->first();

    // Create Admin Kampus Univ A
    $this->adminA = User::factory()->create([
        'role_id' => $adminRole->id,
        'university_id' => $this->univA->id,
        'is_active' => true,
    ]);
    $this->adminA->roles()->attach($adminRole->id);

    // Create Admin Kampus Univ B
    $this->adminB = User::factory()->create([
        'role_id' => $adminRole->id,
        'university_id' => $this->univB->id,
        'is_active' => true,
    ]);
    $this->adminB->roles()->attach($adminRole->id);

    // Create Super Admin for checks
    $this->superAdmin = User::factory()->create([
        'role_id' => $superRole->id,
        'is_active' => true,
    ]);
    $this->superAdmin->roles()->attach($superRole->id);
});

it('allows super admin to access monev rekap-keseluruhan', function () {
    $response = actingAs($this->superAdmin)
        ->get('/admin/monev/rekap-keseluruhan');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Monev/Report')
        ->has('data')
    );
});

it('allows admin kampus with university to access monev rekap-keseluruhan', function () {
    $response = actingAs($this->adminA)
        ->get('/admin-kampus/monev/rekap-keseluruhan');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Monev/Report')
        ->has('data')
    );
});

it('aborts with 403 if admin kampus has no university assigned', function () {
    $adminRole = Role::where('name', Role::ADMIN_KAMPUS)->first();
    $invalidAdmin = User::factory()->create([
        'role_id' => $adminRole->id,
        'university_id' => null,
        'is_active' => true,
    ]);
    $invalidAdmin->roles()->attach($adminRole->id);

    $response = actingAs($invalidAdmin)
        ->get('/admin-kampus/monev/rekap-keseluruhan');

    $response->assertStatus(403);
});

it('strictly enforces multi-tenant boundary for admin kampus when table exists', function () {
    $dosenA = User::factory()->create(['name' => 'Dosen A', 'university_id' => $this->univA->id]);
    $dosenB = User::factory()->create(['name' => 'Dosen B', 'university_id' => $this->univB->id]);

    $proposalA = Proposal::factory()->create(['user_id' => $dosenA->id]);
    $proposalB = Proposal::factory()->create(['user_id' => $dosenB->id]);

    DB::table('contracts')->insert([
        [
            'university_id' => $this->univA->id,
            'proposal_id' => $proposalA->id,
            'title' => 'Penelitian Univ A',
            'status' => 'active',
            'contract_value' => 10000000,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'university_id' => $this->univB->id,
            'proposal_id' => $proposalB->id,
            'title' => 'Penelitian Univ B',
            'status' => 'active',
            'contract_value' => 20000000,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    // Request from Admin A (should only see Univ A data)
    $responseA = actingAs($this->adminA)
        ->get('/admin-kampus/monev/rekap-keseluruhan');

    $responseA->assertStatus(200);
    $responseA->assertInertia(fn ($page) => $page
        ->component('Admin/Monev/Report')
        ->where('data.ringkasan.total_penelitian', 1)
        ->where('data.penelitian_terbaru.data.0.judul_penelitian', 'Penelitian Univ A')
    );

    // Request from Admin B (should only see Univ B data)
    $responseB = actingAs($this->adminB)
        ->get('/admin-kampus/monev/rekap-keseluruhan');

    $responseB->assertStatus(200);
    $responseB->assertInertia(fn ($page) => $page
        ->component('Admin/Monev/Report')
        ->where('data.ringkasan.total_penelitian', 1)
        ->where('data.penelitian_terbaru.data.0.judul_penelitian', 'Penelitian Univ B')
    );

    // Request from Super Admin (should see both Univ A and Univ B data)
    $responseSuper = actingAs($this->superAdmin)
        ->get('/admin/monev/rekap-keseluruhan');

    $responseSuper->assertStatus(200);
    $responseSuper->assertInertia(fn ($page) => $page
        ->component('Admin/Monev/Report')
        ->where('data.ringkasan.total_penelitian', 2)
    );
});

it('allows admin kampus to change research status using decide-action', function () {
    $dosenA = User::factory()->create(['name' => 'Dosen A', 'university_id' => $this->univA->id]);
    $proposalA = Proposal::factory()->create(['user_id' => $dosenA->id]);

    $contractId = DB::table('contracts')->insertGetId([
        'university_id' => $this->univA->id,
        'proposal_id' => $proposalA->id,
        'title' => 'Penelitian Univ A',
        'status' => 'active',
        'contract_value' => 10000000,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = actingAs($this->adminA)
        ->post('/admin-kampus/monev/decide-action', [
            'id' => $contractId,
            'action' => 'Stop',
        ]);

    $response->assertStatus(302); // Redirect back
    $this->assertDatabaseHas('contracts', [
        'id' => $contractId,
        'status' => 'cancelled',
    ]);
});

it('prevents admin kampus from changing research status of another university', function () {
    $dosenB = User::factory()->create(['name' => 'Dosen B', 'university_id' => $this->univB->id]);
    $proposalB = Proposal::factory()->create(['user_id' => $dosenB->id]);

    $contractId = DB::table('contracts')->insertGetId([
        'university_id' => $this->univB->id,
        'proposal_id' => $proposalB->id,
        'title' => 'Penelitian Univ B',
        'status' => 'active',
        'contract_value' => 20000000,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Admin A tries to modify Univ B's contract
    $response = actingAs($this->adminA)
        ->post('/admin-kampus/monev/decide-action', [
            'id' => $contractId,
            'action' => 'Stop',
        ]);

    // Should redirect back without modifying status due to lack of access
    $response->assertStatus(302);
    $this->assertDatabaseHas('contracts', [
        'id' => $contractId,
        'status' => 'active', // remains unchanged
    ]);
});
