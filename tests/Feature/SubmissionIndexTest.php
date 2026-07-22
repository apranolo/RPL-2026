<?php

use App\Models\User;
use App\Models\Submission;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use function Pest\Laravel\{actingAs, get};

// Mengaktifkan fitur reset database otomatis untuk setiap pengujian
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/**
 * Setup Interseptor Pengaman Lingkungan SQLite Memori.
 * Menghindari tabrakan nama index dan kegagalan eksekusi query alter table native MySQL.
 */
beforeEach(function () {
    if (DB::getDriverName() === 'sqlite') {
        // Matikan batasan foreign key sementara untuk memuluskan migrasi SQLite yang bermasalah
        Schema::disableForeignKeyConstraints();
        
        // Bersihkan nama index kembar global sebelum skema tabel essay_questions dieksekusi
        try {
            DB::statement('DROP INDEX IF EXISTS unique_code_per_category');
        } catch (\Exception $e) {}
    }
});

test('user yang belum login dialihkan ke halaman login', function () {
    get(route('submissions.index'))
        ->assertRedirect(route('login'));
});

test('user hanya diperbolehkan melihat data naskah miliknya sendiri', function () {
    // Pembuatan entitas user menggunakan Model Factory
    $userSaya = User::factory()->create();
    $userLain = User::factory()->create();

    // Data naskah milik user aktif saat ini
    Submission::factory()->create([
        'user_id' => $userSaya->id,
        'title' => 'Naskah Milik Saya',
        'status' => 'Submitted'
    ]);

    // Data naskah milik orang lain (Simulasi celah IDOR / Multi-Tenancy)
    Submission::factory()->create([
        'user_id' => $userLain->id,
        'title' => 'Naskah Kompetitor',
        'status' => 'Submitted'
    ]);

    // Autentikasi sebagai user aktif dan periksa isolasi data naskah
    actingAs($userSaya)
        ->get(route('submissions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Submission/Index')
            ->has('submissions.data', 1) // Memastikan hanya ada 1 data yang lolos filter
            ->where('submissions.data.0.title', 'Naskah Milik Saya')
        );
});