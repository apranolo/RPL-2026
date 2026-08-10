<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\ContractDocument;
use App\Models\Funding;
use App\Models\Proposal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class Module3Seeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🧪 Seeding data pendukung pengujian manual Modul 3 (Manajemen Kontrak & Pendanaan)...');

        // 1. Ensure Roles
        $adminKeuanganRole = Role::firstOrCreate(
            ['name' => Role::ADMIN_KEUANGAN],
            ['display_name' => 'Admin Keuangan', 'description' => 'Bertanggung jawab mengelola kontrak dan pencairan dana.']
        );
        $adminKampusRole = Role::firstOrCreate(
            ['name' => Role::ADMIN_KAMPUS],
            ['display_name' => 'Administrator Kampus', 'description' => 'Pengelola LPPM tingkat kampus.']
        );
        $userRole = Role::firstOrCreate(
            ['name' => Role::USER],
            ['display_name' => 'User / Peneliti', 'description' => 'Dosen pengusul dan penerima pendanaan.']
        );

        // 2. Ensure Universities
        $uad = University::firstOrCreate(
            ['code' => 'UAD'],
            ['name' => 'Universitas Ahmad Dahlan', 'city' => 'Yogyakarta', 'is_active' => true]
        );

        // 3. Ensure Users with Bank Account details
        $adminKeuangan = User::firstOrCreate(
            ['email' => 'admin.keuangan@ajm.ac.id'],
            [
                'name' => 'Bambang Subagyo, S.E.',
                'password' => Hash::make('password123'),
                'role_id' => $adminKeuanganRole->id,
                'university_id' => $uad->id,
                'bank_name' => 'Bank Mandiri',
                'account_number' => '1370098765432',
                'account_name' => 'Bambang Subagyo',
            ]
        );
        $adminKeuangan->roles()->syncWithoutDetaching([$adminKeuanganRole->id]);

        $dosen1 = User::firstOrCreate(
            ['email' => 'andi.prasetyo@uad.ac.id'],
            [
                'name' => 'Dr. Andi Prasetyo, M.T.',
                'password' => Hash::make('password123'),
                'role_id' => $userRole->id,
                'university_id' => $uad->id,
                'bank_name' => 'Bank Mandiri',
                'account_number' => '1370012345678',
                'account_name' => 'Dr. Andi Prasetyo, M.T.',
            ]
        );
        $dosen1->roles()->syncWithoutDetaching([$userRole->id]);

        $dosen2 = User::firstOrCreate(
            ['email' => 'budi.santoso@uad.ac.id'],
            [
                'name' => 'Prof. Dr. Budi Santoso',
                'password' => Hash::make('password123'),
                'role_id' => $userRole->id,
                'university_id' => $uad->id,
                'bank_name' => 'Bank BNI',
                'account_number' => '0234567891',
                'account_name' => 'Prof. Dr. Budi Santoso',
            ]
        );
        $dosen2->roles()->syncWithoutDetaching([$userRole->id]);

        $schema = \App\Models\ResearchSchema::first() ?? \App\Models\ResearchSchema::create([
            'name' => 'Penelitian Dasar Perguruan Tinggi (PDPT)',
            'description' => 'Skema riset dasar perintisan invensi.',
        ]);

        // 4. Ensure Proposals for Contract Binding
        $proposal1 = Proposal::firstOrCreate(
            ['title' => 'Pengembangan Sistem Deteksi Dini Bencana Longsor Berbasis IoT'],
            [
                'description' => 'Riset pengembangan sensor nirkabel deteksi pergerakan tanah.',
                'user_id' => $dosen1->id,
                'research_schema_id' => $schema->id,
                'status_proposal' => 'Diterima',
            ]
        );

        $proposal2 = Proposal::firstOrCreate(
            ['title' => 'Optimalisasi Algoritma Kriptografi pada Perangkat IoT Energi Rendah'],
            [
                'description' => 'Studi keamanan algoritma simetris pada perangkat mikro terikat energi.',
                'user_id' => $dosen2->id,
                'research_schema_id' => $schema->id,
                'status_proposal' => 'Diterima',
            ]
        );

        $proposal3 = Proposal::firstOrCreate(
            ['title' => 'Pengembangan Microgrid Energi Terbarukan Terintegrasi'],
            [
                'description' => 'Pengembangan jaringan microgrid terdistribusi energi terbarukan.',
                'user_id' => $dosen1->id,
                'research_schema_id' => $schema->id,
                'status_proposal' => 'Diterima',
            ]
        );

        // 5. Contracts & Fundings for Manual Testing Scenarios

        // Contract 1: Draft Contract (Scenario 1)
        Contract::firstOrCreate(
            ['contract_number' => 'KON-2026-0001'],
            [
                'title' => 'Kontrak Penelitian IoT Deteksi Longsor 2026',
                'proposal_id' => $proposal1->id,
                'university_id' => $uad->id,
                'contract_value' => 150000000.00,
                'status' => 'draft',
                'party_1' => 'LPPM Universitas Ahmad Dahlan',
                'party_2' => 'Dr. Andi Prasetyo, M.T.',
                'start_date' => '2026-06-01',
                'end_date' => '2026-12-31',
                'terms' => 'Perjanjian pelaksanaan hibah riset skema dasar tahun anggaran 2026.',
                'notes' => 'Draf kontrak menunggu pengesahan jadwal pencairan termin.',
                'created_by' => $adminKeuangan->id,
            ]
        );

        // Contract 2: Active Contract with Termin 1 Disbursed & Termin 2 Planned (Scenario 2 & 4)
        $contract2 = Contract::firstOrCreate(
            ['contract_number' => 'KON-2026-0002'],
            [
                'title' => 'Kontrak Kriptografi IoT Energi Rendah 2026',
                'proposal_id' => $proposal2->id,
                'university_id' => $uad->id,
                'contract_value' => 100000000.00,
                'status' => 'active',
                'party_1' => 'LPPM Universitas Ahmad Dahlan',
                'party_2' => 'Prof. Dr. Budi Santoso',
                'start_date' => '2026-04-01',
                'end_date' => '2026-11-30',
                'terms' => 'Pelaksanaan pencairan dana dibagi dalam 2 termin (40% dan 60%).',
                'notes' => 'Termin 1 telah dicairkan, termin 2 siap diproses.',
                'created_by' => $adminKeuangan->id,
            ]
        );

        Funding::firstOrCreate(
            ['contract_id' => $contract2->id, 'funding_number' => 'TRM-01'],
            [
                'description' => 'Pencairan Termin 1 (40%)',
                'percentage' => 40.00,
                'amount' => 40000000.00,
                'status' => Funding::STATUS_DISBURSED,
                'funding_date' => '2026-04-15',
                'paid_at' => '2026-04-16 10:00:00',
                'payment_method' => 'Bank Transfer',
                'reference_number' => 'TRF-20260416-001',
                'proof_document_path' => 'uploads/proofs/slip_termin_1.pdf',
                'created_by' => $adminKeuangan->id,
                'approved_by' => $adminKeuangan->id,
            ]
        );

        Funding::firstOrCreate(
            ['contract_id' => $contract2->id, 'funding_number' => 'TRM-02'],
            [
                'description' => 'Pencairan Termin 2 (60%)',
                'percentage' => 60.00,
                'amount' => 60000000.00,
                'status' => Funding::STATUS_PLANNED,
                'funding_date' => '2026-09-01',
                'created_by' => $adminKeuangan->id,
            ]
        );

        // Uploaded Document for Contract 2
        ContractDocument::firstOrCreate(
            ['contract_id' => $contract2->id, 'document_type' => 'Arsip Kontrak TTD'],
            [
                'document_name' => 'Dokumen_Kontrak_TTD_Budi_Santoso.pdf',
                'file_path' => 'uploads/contracts/dokumen_kontrak_ttd_002.pdf',
                'file_size' => 2450000,
                'mime_type' => 'application/pdf',
                'uploaded_by' => $adminKeuangan->id,
            ]
        );

        // Contract 3: Finished Contract with 100% Disbursed (Scenario 5)
        $contract3 = Contract::firstOrCreate(
            ['contract_number' => 'KON-2026-0003'],
            [
                'title' => 'Kontrak Microgrid Terbarukan 2026',
                'proposal_id' => $proposal3->id,
                'university_id' => $uad->id,
                'contract_value' => 200000000.00,
                'status' => 'selesai',
                'party_1' => 'LPPM Universitas Ahmad Dahlan',
                'party_2' => 'Dr. Andi Prasetyo, M.T.',
                'start_date' => '2026-01-10',
                'end_date' => '2026-06-30',
                'terms' => 'Pencairan dana 100% lunas.',
                'notes' => 'Seluruh pencairan dan laporan monev telah selesai disetujui.',
                'created_by' => $adminKeuangan->id,
            ]
        );

        Funding::firstOrCreate(
            ['contract_id' => $contract3->id, 'funding_number' => 'TRM-01'],
            [
                'description' => 'Pencairan Tahap Pertama (50%)',
                'percentage' => 50.00,
                'amount' => 100000000.00,
                'status' => Funding::STATUS_DISBURSED,
                'funding_date' => '2026-01-20',
                'paid_at' => '2026-01-22 11:30:00',
                'payment_method' => 'Bank Transfer',
                'reference_number' => 'TRF-20260122-008',
                'created_by' => $adminKeuangan->id,
                'approved_by' => $adminKeuangan->id,
            ]
        );

        Funding::firstOrCreate(
            ['contract_id' => $contract3->id, 'funding_number' => 'TRM-02'],
            [
                'description' => 'Pencairan Tahap Akhir (50%)',
                'percentage' => 50.00,
                'amount' => 100000000.00,
                'status' => Funding::STATUS_DISBURSED,
                'funding_date' => '2026-05-15',
                'paid_at' => '2026-05-18 14:15:00',
                'payment_method' => 'Bank Transfer',
                'reference_number' => 'TRF-20260518-044',
                'created_by' => $adminKeuangan->id,
                'approved_by' => $adminKeuangan->id,
            ]
        );

        $this->command->info('✅ Module3Seeder berhasil disemai!');
        $this->command->info('📌 Akun Uji Tambahan: Admin Keuangan (admin.keuangan@ajm.ac.id / password123)');
    }
}
