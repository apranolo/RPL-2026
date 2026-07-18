<?php

use App\Http\Controllers\FinanceReportController;
use App\Models\Contract;
use App\Models\Funding;
use App\Models\Proposal;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('builds finance report summary from contracts and fundings', function () {
    $university = University::factory()->create([
        'name' => 'Universitas Tes',
    ]);

    $proposal = Proposal::factory()->create();

    $contract = Contract::create([
        'university_id' => $university->id,
        'proposal_id' => $proposal->id,
        'contract_number' => 'CT-001',
        'title' => 'Kontrak Hibah Penelitian',
        'status' => 'active',
        'contract_value' => 1000000,
        'party_1' => 'Pihak A',
        'party_2' => 'Pihak B',
        'signed_at' => '2025-03-01',
        'start_date' => '2025-03-01',
        'end_date' => '2025-12-31',
    ]);

    Funding::create([
        'contract_id' => $contract->id,
        'funding_number' => 'TERMIN-1',
        'description' => 'Termin pertama',
        'amount' => 400000,
        'percentage' => 40,
        'status' => Funding::STATUS_DISBURSED,
        'paid_at' => '2025-04-01 00:00:00',
    ]);

    $controller = new FinanceReportController;
    $summary = $controller->summary(2025, 'all');

    expect($summary['total_contracts'])->toBe(1)
        ->and($summary['total_contract_value'])->toBe(1000000.0)
        ->and($summary['total_disbursed'])->toBe(400000.0)
        ->and($summary['remaining_balance'])->toBe(600000.0)
        ->and($summary['data'][0]['contract_title'])->toBe('Kontrak Hibah Penelitian')
        ->and($summary['data'][0]['university'])->toBe('Universitas Tes');
});
