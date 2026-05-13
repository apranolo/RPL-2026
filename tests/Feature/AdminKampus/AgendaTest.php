<?php

use App\Models\Agenda;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seedRoles();

    // Create Admin Kampus
    $this->university = University::factory()->create();
    $adminRole = Role::where('name', Role::ADMIN_KAMPUS)->first();

    $this->adminKampus = User::factory()->create([
        'role_id' => $adminRole->id,
        'university_id' => $this->university->id,
        'is_active' => true,
    ]);
    $this->adminKampus->roles()->attach($adminRole->id);

    // Create Super Admin for cross-checks
    $superRole = Role::where('name', Role::SUPER_ADMIN)->first();
    $this->superAdmin = User::factory()->create([
        'role_id' => $superRole->id,
        'is_active' => true,
    ]);
    $this->superAdmin->roles()->attach($superRole->id);
});

// Helper for valid payload
function validAgendaPayload(): array
{
    return [
        'title' => 'Test Agenda 1',
        'type' => 'Seminar',
        'description' => 'Ini event testing.',
        'date_start' => now()->addDays(5)->format('Y-m-d'),
        'date_end' => now()->addDays(6)->format('Y-m-d'),
        'time_start' => '09:00',
        'time_end' => '15:00',
        'location_type' => 'Online',
        'location_venue' => 'Zoom',
        'location_link' => 'https://zoom.us',
        'registration_link' => 'https://example.com/register',
        'price' => 0,
        'contact_person_name' => 'Alice',
        'contact_person_phone' => '08123456789',
        'contact_person_email' => 'alice@test.com',
        'is_active' => 1, // Inertia boolean pass over forms as 1/0
        'is_featured' => 0,
    ];
}

it('allows active admin kampus to view agenda list', function () {
    Agenda::factory()->count(3)->create([
        'university_id' => $this->university->id,
    ]);

    $response = actingAs($this->adminKampus)->get(route('admin-kampus.events.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('AdminKampus/Events/Index')
        ->has('events.data', 3)
    );
});

it('prevents admin kampus from viewing other university agendas', function () {
    $otherUniv = University::factory()->create();
    Agenda::factory()->count(2)->create([
        'university_id' => $otherUniv->id,
    ]);

    $response = actingAs($this->adminKampus)->get(route('admin-kampus.events.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('AdminKampus/Events/Index')
        ->has('events.data', 0) // Should be empty since it's filtered
    );
});

it('allows admin kampus to store a new agenda', function () {
    $payload = validAgendaPayload();

    $response = actingAs($this->adminKampus)
        ->post(route('admin-kampus.events.store'), $payload);

    $response->assertRedirect(route('admin-kampus.events.index'));
    $this->assertDatabaseHas('agendas', [
        'title' => 'Test Agenda 1',
        'university_id' => $this->university->id,
        'user_id' => $this->adminKampus->id,
    ]);
});

it('preserves null quota for unlimited events', function () {
    $payload = validAgendaPayload();
    unset($payload['quota']); // Omit quota

    actingAs($this->adminKampus)
        ->post(route('admin-kampus.events.store'), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('agendas', [
        'title' => 'Test Agenda 1',
        'quota' => null,
    ]);

    $agenda = Agenda::where('title', 'Test Agenda 1')->first();

    $updatePayload = validAgendaPayload();
    $updatePayload['title'] = 'Updated Title';
    unset($updatePayload['quota']); // Omit quota in update as well

    actingAs($this->adminKampus)
        ->put(route('admin-kampus.events.update', $agenda->id), $updatePayload)
        ->assertRedirect();

    $this->assertDatabaseHas('agendas', [
        'id' => $agenda->id,
        'title' => 'Updated Title',
        'quota' => null,
    ]);
});

it('generates unique slugs for duplicate titles correctly', function () {
    // Create first agenda
    Agenda::factory()->create([
        'title' => 'Test Slug',
        'slug' => null, // Allow boot() generating slug
        'university_id' => $this->university->id,
    ]);

    // Create second agenda with same title
    $agenda2 = Agenda::factory()->create([
        'title' => 'Test Slug',
        'slug' => null,
        'university_id' => $this->university->id,
    ]);

    expect($agenda2->slug)->toBe('test-slug-1');

    // Create third agenda with same title
    $agenda3 = Agenda::factory()->create([
        'title' => 'Test Slug',
        'slug' => null,
        'university_id' => $this->university->id,
    ]);

    expect($agenda3->slug)->toBe('test-slug-2');

    // Manually delete test-slug-1 to create a "hole"
    Agenda::where('slug', 'test-slug-1')->forceDelete();

    // Create fourth agenda - should fill the hole or handle it
    $agenda4 = Agenda::factory()->create([
        'title' => 'Test Slug',
        'slug' => null,
        'university_id' => $this->university->id,
    ]);

    // Since we deleted test-slug-1, the next free one is test-slug-1
    expect($agenda4->slug)->toBe('test-slug-1');
});

it('allows setting quota to zero explicitly', function () {
    $payload = validAgendaPayload();
    $payload['quota'] = 0;

    actingAs($this->adminKampus)
        ->post(route('admin-kampus.events.store'), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('agendas', [
        'title' => 'Test Agenda 1',
        'quota' => 0,
    ]);
});

it('allows admin kampus to update their own agenda', function () {
    $agenda = Agenda::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->adminKampus->id,
    ]);

    $payload = validAgendaPayload();
    $payload['title'] = 'Updated Title';

    $response = actingAs($this->adminKampus)
        ->put(route('admin-kampus.events.update', $agenda), $payload);

    $response->assertRedirect(route('admin-kampus.events.index'));
    $this->assertDatabaseHas('agendas', [
        'id' => $agenda->id,
        'title' => 'Updated Title',
    ]);
});

it('prevents admin kampus from updating another university agenda', function () {
    $otherUniv = University::factory()->create();
    $agenda = Agenda::factory()->create([
        'university_id' => $otherUniv->id,
    ]);

    $payload = validAgendaPayload();
    $payload['title'] = 'Malicious Update';

    $response = actingAs($this->adminKampus)
        ->put(route('admin-kampus.events.update', $agenda), $payload);

    $response->assertForbidden();

    $this->assertDatabaseMissing('agendas', [
        'id' => $agenda->id,
        'title' => 'Malicious Update',
    ]);
});

it('allows admin kampus to soft delete their own agenda', function () {
    $agenda = Agenda::factory()->create([
        'university_id' => $this->university->id,
    ]);

    $response = actingAs($this->adminKampus)
        ->delete(route('admin-kampus.events.destroy', $agenda));

    $response->assertRedirect(route('admin-kampus.events.index'));
    $this->assertSoftDeleted('agendas', ['id' => $agenda->id]);
});
