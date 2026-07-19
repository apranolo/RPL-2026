<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Models\ResearchSchema;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

uses()->group('feature', 'performance', 'statistics', 'modul6-kelasB');

beforeEach(function () {
    $this->seedRoles();
    Cache::flush();

    // Buat university sebagai proxy Fakultas
    $this->university = University::factory()->create([
        'name' => 'Fakultas Teknik',
    ]);

    // Buat user dosen di fakultas ini
    $this->user = User::factory()->user()->create([
        'university_id' => $this->university->id,
    ]);

    // Buat admin kampus
    $this->admin = User::factory()->adminKampus()->create([
        'university_id' => $this->university->id,
    ]);

    // Buat skema penelitian
    $this->schema1 = ResearchSchema::factory()->create(['name' => 'Penelitian Dasar']);
    $this->schema2 = ResearchSchema::factory()->create(['name' => 'Penelitian Terapan']);
});

describe('Faculty Performance Analytics (Modul 6 Kelas B)', function () {

    test('getFacultyStat mengembalikan jumlah proposal dan luaran yang benar per fakultas', function () {
        // Buat 3 proposal (submitted)
        for ($i = 0; $i < 3; $i++) {
            DB::table('proposals')->insert([
                'title' => 'Proposal '.$i,
                'description' => 'Deskripsi '.$i,
                'user_id' => $this->user->id,
                'research_schema_id' => $this->schema1->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Buat 2 luaran dengan status approved (accepted)
        for ($i = 0; $i < 2; $i++) {
            DB::table('research_outputs')->insert([
                'user_id' => $this->user->id,
                'jenis_luaran' => 'Jurnal',
                'judul_luaran' => 'Luaran '.$i,
                'file_sertifikat_atau_cover' => 'file'.$i.'.pdf',
                'status_verifikasi' => 'Terverifikasi_LPPM',
                'keterangan' => 'test',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Buat 1 luaran pending — TIDAK boleh dihitung sebagai accepted
        DB::table('research_outputs')->insert([
            'user_id' => $this->user->id,
            'jenis_luaran' => 'Buku',
            'judul_luaran' => 'Luaran Pending',
            'file_sertifikat_atau_cover' => 'pending.pdf',
            'status_verifikasi' => 'Menunggu_Verifikasi',
            'keterangan' => 'test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ctrl = new DashboardController;
        $stats = $ctrl->getFacultyStat();

        expect($stats)->toBeArray();
        expect(count($stats))->toBe(1);

        $facultyStat = $stats[0];
        expect($facultyStat['faculty_name'])->toBe('Fakultas Teknik');
        expect($facultyStat['submitted'])->toBe(3);
        expect($facultyStat['accepted'])->toBe(2);
    });

    test('getCategoryStat mengembalikan distribusi kategori proposal per skema yang benar', function () {
        // 2 proposal di schema 1
        for ($i = 0; $i < 2; $i++) {
            DB::table('proposals')->insert([
                'title' => 'Schema1 Proposal '.$i,
                'description' => 'Desc',
                'user_id' => $this->user->id,
                'research_schema_id' => $this->schema1->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3 proposal di schema 2
        for ($i = 0; $i < 3; $i++) {
            DB::table('proposals')->insert([
                'title' => 'Schema2 Proposal '.$i,
                'description' => 'Desc',
                'user_id' => $this->user->id,
                'research_schema_id' => $this->schema2->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $ctrl = new DashboardController;
        $catStat = $ctrl->getCategoryStat();

        expect($catStat['total'])->toBe(5);
        expect(count($catStat['categories']))->toBe(2);

        $categories = collect($catStat['categories'])->keyBy('label');

        expect($categories['Penelitian Dasar']['value'])->toBe(2);
        expect($categories['Penelitian Dasar']['percentage'])->toBe(40.0);

        expect($categories['Penelitian Terapan']['value'])->toBe(3);
        expect($categories['Penelitian Terapan']['percentage'])->toBe(60.0);
    });

    test('statistik disimpan di cache dan dapat dihapus melalui clearFacultyCache', function () {
        DB::table('proposals')->insert([
            'title' => 'Prop 1',
            'description' => 'Desc',
            'user_id' => $this->user->id,
            'research_schema_id' => $this->schema1->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ctrl = new DashboardController;

        // Cold cache — ambil data baru
        $stats1 = $ctrl->getFacultyStat();
        expect($stats1[0]['submitted'])->toBe(1);

        // Tambah data langsung ke DB (melewati cache)
        DB::table('proposals')->insert([
            'title' => 'Prop 2',
            'description' => 'Desc',
            'user_id' => $this->user->id,
            'research_schema_id' => $this->schema1->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Warm cache — masih mengembalikan 1
        $stats2 = $ctrl->getFacultyStat();
        expect($stats2[0]['submitted'])->toBe(1);

        // Hapus cache
        DashboardController::clearFacultyCache();

        // Setelah cache dihapus — mengembalikan data terbaru
        $stats3 = $ctrl->getFacultyStat();
        expect($stats3[0]['submitted'])->toBe(2);
    });
});
