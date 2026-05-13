<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFundingRequest;
use App\Models\Funding;
use App\Services\FundingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FundingController extends Controller
{
    protected $fundingService;

    public function __construct(FundingService $fundingService)
    {
        $this->fundingService = $fundingService;
    }

    /**
     * Display the form for creating a new termin.
     */
    public function create()
    {
        // For now, we'll pass some dummy data for contracts
        // In a real app, this would come from a Contract model
        $contracts = [
            ['id' => 1, 'number' => '001/CONT/2026', 'total' => 50000000],
            ['id' => 2, 'number' => '002/CONT/2026', 'total' => 75000000],
        ];

        return Inertia::render('Finance/Funding/Create', [
            'contracts' => $contracts,
        ]);
    }

    /**
     * Store a new termin disbursement record.
     */
    public function storeTermin(StoreFundingRequest $request)
    {
        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('evidence')) {
            $path = $request->file('evidence')->store('funding_evidence', 'public');
            $data['evidence_path'] = $path;
        }

        // Logic check: ensure amount doesn't exceed sisa
        // In a real app, we'd fetch the totalApproved from the contract
        $totalApproved = 50000000; // Placeholder
        $sisa = $this->fundingService->calculateSisa($data['contract_id'], $totalApproved);

        if ($data['amount'] > $sisa) {
            return back()->withErrors(['amount' => "Nominal melebihi sisa dana kontrak (Sisa: Rp " . number_format($sisa, 0, ',', '.') . ")"]);
        }

        $this->fundingService->storeTermin($data);

        return redirect()->route('dashboard')->with('success', 'Termin pencairan berhasil disimpan.');
    }
}
