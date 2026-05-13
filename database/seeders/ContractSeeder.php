<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\FundingTerm;
use App\Models\User;
use Illuminate\Database\Seeder;

class ContractSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some researchers/users with role 'user'
        $researchers = User::whereHas('roles', function ($query) {
            $query->where('name', 'user');
        })->take(5)->get();

        if ($researchers->isEmpty()) {
            $this->command->info('No users with role "user" found. Skipping ContractSeeder.');
            return;
        }

        // Create contracts for each researcher
        foreach ($researchers as $key => $researcher) {
            $contract = Contract::create([
                'researcher_id' => $researcher->id,
                'contract_number' => 'KTK-' . date('Y') . '-' . str_pad($key + 1, 3, '0', STR_PAD_LEFT),
                'contract_date' => now()->subMonths(6)->addDays($key * 10),
                'party_1' => 'LPPM Universitas ' . ($researcher->university?->name ?? 'Umum'),
                'party_2' => $researcher->name,
                'total_approved_funding' => (($key + 1) * 50000000), // 50M, 100M, 150M, etc
                'contract_status' => ['aktif', 'aktif', 'aktif', 'selesai', 'ditangguhkan'][$key] ?? 'aktif',
                'created_by' => 1,
            ]);

            // Create funding terms for each contract
            $totalPercentage = 0;
            $termCount = rand(2, 4); // 2-4 terms per contract
            
            for ($termIndex = 1; $termIndex <= $termCount; $termIndex++) {
                // Calculate percentage to ensure total is 100%
                if ($termIndex === $termCount) {
                    $percentage = 100 - $totalPercentage;
                } else {
                    $percentage = rand(20, 40);
                    $totalPercentage += $percentage;
                }

                $nominal = ($contract->total_approved_funding * $percentage) / 100;
                $statuses = ['cair', 'cair', 'menunggu', 'ditangguhkan'];
                $status = $statuses[array_rand($statuses)];

                FundingTerm::create([
                    'contract_id' => $contract->id,
                    'order' => $termIndex,
                    'term_name' => 'Tahap ' . $termIndex,
                    'percentage' => $percentage,
                    'nominal' => $nominal,
                    'status' => $status,
                    'disbursement_date' => $status === 'cair' ? now()->subDays(rand(1, 30)) : null,
                    'receipt_number' => $status === 'cair' ? 'RCP-' . date('Y') . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT) : null,
                    'notes' => $termIndex === 1 ? 'Tahap awal penelitian' : ($termIndex === $termCount ? 'Tahap penutupan penelitian' : 'Tahap tengah penelitian'),
                ]);
            }

            $this->command->info("Contract {$contract->contract_number} created with {$termCount} funding terms.");
        }

        $this->command->info('ContractSeeder completed successfully.');
    }
}
