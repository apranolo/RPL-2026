<?php

use App\Http\Controllers\FinanceReportController;
use App\Models\Contract;
use App\Models\Funding;
use App\Models\University;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

it('builds finance report summary from contracts and fundings', function () {
    Schema::dropIfExists('fundings');
    Schema::dropIfExists('contracts');
    Schema::dropIfExists('universities');

    Schema::create('universities', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->timestamps();
    });

    Schema::create('contracts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('university_id')->nullable()->constrained('universities');
        $table->string('contract_number')->unique();
        $table->string('title');
        $table->string('status')->default('active');
        $table->decimal('contract_value', 12, 2)->default(0);
        $table->date('signed_at')->nullable();
        $table->date('start_date')->nullable();
        $table->date('end_date')->nullable();
        $table->timestamps();
    });

    Schema::create('fundings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('contract_id')->constrained('contracts');
        $table->string('funding_number');
        $table->decimal('amount', 12, 2)->default(0);
        $table->string('status')->default('disbursed');
        $table->timestamp('paid_at')->nullable();
        $table->timestamps();
    });

    $university = University::create(['name' => 'Universitas Tes']);

    $contract = Contract::create([
        'university_id' => $university->id,
        'contract_number' => 'CT-001',
        'title' => 'Kontrak Hibah Penelitian',
        'status' => 'active',
        'contract_value' => 1000000,
        'signed_at' => '2025-03-01',
        'start_date' => '2025-03-01',
        'end_date' => '2025-12-31',
    ]);

    Funding::create([
        'contract_id' => $contract->id,
        'funding_number' => 'TERMIN-1',
        'amount' => 400000,
        'status' => 'disbursed',
        'paid_at' => '2025-04-01 00:00:00',
    ]);

    $controller = new FinanceReportController();
    $summary = $controller->summary(2025, 'all');

    expect($summary['total_contracts'])->toBe(1)
        ->and($summary['total_contract_value'])->toBe(1000000.0)
        ->and($summary['total_disbursed'])->toBe(400000.0)
        ->and($summary['remaining_balance'])->toBe(600000.0)
        ->and($summary['data'][0]['contract_title'])->toBe('Kontrak Hibah Penelitian')
        ->and($summary['data'][0]['university'])->toBe('Universitas Tes');
});
