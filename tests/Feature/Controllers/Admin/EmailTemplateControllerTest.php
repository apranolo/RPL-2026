<?php

use App\Models\EmailTemplate;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles
    $this->seed(RoleSeeder::class);

    // Create Super Admin user
    $this->superAdmin = User::factory()->create([
        'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
        'university_id' => University::factory()->create()->id,
        'is_active' => true,
    ]);

    // Create non-Super Admin user for authorization tests (e.g. Admin Kampus)
    $this->adminKampus = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->first()->id,
        'university_id' => University::factory()->create()->id,
        'is_active' => true,
    ]);
});

// ============================================================================
// INDEX TESTS
// ============================================================================

test('Super Admin can view email templates index page', function () {
    $template = EmailTemplate::factory()->create([
        'name' => 'Test Email Template',
        'event_trigger' => 'test_event',
        'subject' => 'Test Subject',
        'body' => 'Test body with {{variable}}',
        'variables' => ['variable'],
        'is_active' => true,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.email-template.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/EmailTemplate/Index')
            ->has('emailTemplates', 1)
            ->where('emailTemplates.0.name', 'Test Email Template')
        );
});

test('Non-Super Admin cannot view email templates index page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.email-template.index'))
        ->assertForbidden();
});

// ============================================================================
// UPDATE TESTS
// ============================================================================

test('Super Admin can update email template with valid data', function () {
    $template = EmailTemplate::factory()->create([
        'name' => 'Original Name',
        'event_trigger' => 'original_trigger',
        'subject' => 'Original Subject',
        'body' => 'Original body content',
        'is_active' => true,
    ]);

    $updatedData = [
        'name' => 'Updated Name',
        'event_trigger' => 'updated_trigger',
        'subject' => 'Updated Subject',
        'body' => 'Updated body content with {{var}}',
        'variables' => ['var'],
        'description' => 'Updated description',
        'is_active' => false,
    ];

    actingAs($this->superAdmin)
        ->put(route('admin.email-template.update', $template->id), $updatedData)
        ->assertRedirect()
        ->assertSessionHas('success', 'Email template berhasil diperbarui.');

    assertDatabaseHas('email_templates', [
        'id' => $template->id,
        'name' => 'Updated Name',
        'event_trigger' => 'updated_trigger',
        'subject' => 'Updated Subject',
        'body' => 'Updated body content with {{var}}',
        'description' => 'Updated description',
        'is_active' => false,
    ]);
});

test('Non-Super Admin cannot update email template', function () {
    $template = EmailTemplate::factory()->create();

    $updatedData = [
        'name' => 'Attempted Name Update',
        'event_trigger' => 'attempted_trigger',
        'subject' => 'Attempted Subject',
        'body' => 'Attempted body content',
        'is_active' => false,
    ];

    actingAs($this->adminKampus)
        ->put(route('admin.email-template.update', $template->id), $updatedData)
        ->assertForbidden();
});

test('updating email template requires valid validation rules', function () {
    $template = EmailTemplate::factory()->create();

    // Try updating with empty name, empty subject, and empty body
    actingAs($this->superAdmin)
        ->put(route('admin.email-template.update', $template->id), [
            'name' => '',
            'event_trigger' => '',
            'subject' => '',
            'body' => '',
            'is_active' => 'not-a-boolean',
        ])
        ->assertSessionHasErrors(['name', 'event_trigger', 'subject', 'body', 'is_active']);
});
