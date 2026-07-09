<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFundingRequest;
use App\Models\Funding;
use App\Services\FundingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FundingController extends Controller
{
    public function create()
    {
        $contracts = [];

        if (class_exists(\App\Models\Contract::class) && auth()->check()) {
            $universityId = auth()->user()->university_id;
            $contracts = \App\Models\Contract::where('university_id', $universityId)->get();
        }

        return Inertia::render('Finance/Funding/Create', [
            'contracts' => $contracts,
        ]);
    }

    public function storeTermin(StoreFundingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        // Ensure contract belongs to the current user's university
        if (! class_exists(\App\Models\Contract::class)) {
            abort(500, 'Contract model not found');
        }

        $contract = \App\Models\Contract::where('id', $data['contract_id'])
            ->where('university_id', auth()->user()->university_id)
            ->firstOrFail();

        $funding = Funding::create([
            'contract_id' => $data['contract_id'],
            'amount' => $data['amount'],
            'termin_number' => $data['termin_number'] ?? 1,
            'termin_date' => $data['termin_date'] ?? now(),
            'user_id' => auth()->id(),
            'notes' => $data['notes'] ?? null,
        ]);

        $sisa = FundingService::calculateSisa($funding->contract_id, auth()->user());

        return back()
            ->with('success', 'Termin pencairan berhasil disimpan.')
            ->with('sisa', $sisa);
    }
}
