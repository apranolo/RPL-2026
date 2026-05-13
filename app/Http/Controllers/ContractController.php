<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\PembinaanRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handle research contract (Kontrak Penelitian) management.
 *
 * @route /finance/contracts
 * @features Generate draft contract, view contract detail, update contract status
 */
class ContractController extends Controller
{
    /**
     * Display a listing of all contracts.
     *
     * @route GET /finance/contracts
     */
    public function index(Request $request): Response
    {
        $query = Contract::with(['registration.journal', 'registration.user', 'registration.pembinaan'])
            ->latest();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by search (contract number or researcher name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('contract_number', 'like', "%{$search}%")
                    ->orWhereHas('registration.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('registration.journal', fn ($j) => $j->where('title', 'like', "%{$search}%"));
            });
        }

        $contracts = $query->paginate(15)->withQueryString();

        return Inertia::render('Finance/Contract/Index', [
            'contracts' => $contracts,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display detail of a single contract.
     *
     * @route GET /finance/contracts/{contract}
     */
    public function show(Contract $contract): Response
    {
        $contract->load([
            'registration.journal.university',
            'registration.user',
            'registration.pembinaan',
            'generatedBy',
            'updatedBy',
        ]);

        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => '/dashboard'],
            ['title' => 'Kontrak', 'href' => route('finance.contracts.index')],
            ['title' => $contract->contract_number, 'href' => route('finance.contracts.show', $contract)],
        ];

        return Inertia::render('Finance/Contract/Show', [
            'contract' => $contract,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Generate a draft contract for an approved pembinaan registration.
     *
     * Workflow:
     *  1. Validate that the registration is approved and has no existing contract.
     *  2. Auto-generate a unique contract number.
     *  3. Create the contract record with status 'draft'.
     *  4. Redirect to the contract detail page.
     *
     * @route POST /finance/contracts/generate
     */
    public function generate(Request $request): RedirectResponse
    {
        $request->validate([
            'registration_id' => ['required', 'integer', 'exists:pembinaan_registrations,id'],
            'nilai_kontrak'   => ['nullable', 'numeric', 'min:0'],
            'tanggal_mulai'   => ['nullable', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'catatan'         => ['nullable', 'string', 'max:2000'],
        ], [
            'registration_id.required' => 'Registrasi wajib dipilih.',
            'registration_id.exists'   => 'Registrasi tidak ditemukan.',
            'nilai_kontrak.numeric'    => 'Nilai kontrak harus berupa angka.',
            'nilai_kontrak.min'        => 'Nilai kontrak tidak boleh negatif.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        /** @var PembinaanRegistration $registration */
        $registration = PembinaanRegistration::with(['pembinaan', 'journal', 'user'])
            ->findOrFail($request->registration_id);

        // Guard: registration must be approved
        if ($registration->status !== 'approved') {
            return back()->with('error', 'Kontrak hanya dapat dibuat untuk registrasi yang sudah disetujui.');
        }

        // Guard: prevent duplicate contract for the same registration
        $existing = Contract::where('registration_id', $registration->id)->first();
        if ($existing) {
            return back()->with('error', "Kontrak untuk registrasi ini sudah ada: {$existing->contract_number}.");
        }

        // Generate unique contract number: format SPK-YYYY-XXXXX
        $contractNumber = $this->generateContractNumber();

        $contract = Contract::create([
            'registration_id' => $registration->id,
            'contract_number' => $contractNumber,
            'nilai_kontrak'   => $request->nilai_kontrak,
            'tanggal_mulai'   => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'catatan'         => $request->catatan,
            'status'          => Contract::STATUS_DRAFT,
            'generated_by'    => auth()->id(),
        ]);

        return redirect()
            ->route('finance.contracts.show', $contract)
            ->with('success', "Draft kontrak {$contractNumber} berhasil dibuat.");
    }

    /**
     * Update the status of a contract.
     *
     * Valid transitions:
     *  - draft      → aktif    (activate the contract)
     *  - aktif      → selesai  (mark contract as completed)
     *  - aktif      → draft    (revert to draft for revision)
     *  - draft/aktif → batal   (cancel the contract)
     *
     * @route PATCH /finance/contracts/{contract}/status
     */
    public function updateStatus(Request $request, Contract $contract): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:draft,aktif,selesai,batal'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ], [
            'status.required' => 'Status baru wajib diisi.',
            'status.in'       => 'Status tidak valid. Pilih: draft, aktif, selesai, atau batal.',
        ]);

        $newStatus = $request->status;
        $currentStatus = $contract->status;

        // Validate status transitions
        $allowedTransitions = [
            Contract::STATUS_DRAFT  => [Contract::STATUS_AKTIF, Contract::STATUS_BATAL],
            Contract::STATUS_AKTIF  => [Contract::STATUS_SELESAI, Contract::STATUS_DRAFT, Contract::STATUS_BATAL],
            Contract::STATUS_SELESAI => [], // terminal state
            Contract::STATUS_BATAL  => [], // terminal state
        ];

        $allowed = $allowedTransitions[$currentStatus] ?? [];

        if (! in_array($newStatus, $allowed)) {
            $label = Contract::statusLabels()[$currentStatus] ?? $currentStatus;
            return back()->with('error', "Kontrak berstatus \"{$label}\" tidak dapat diubah ke \"{$newStatus}\".");
        }

        $contract->update([
            'status'     => $newStatus,
            'catatan'    => $request->filled('catatan') ? $request->catatan : $contract->catatan,
            'updated_by' => auth()->id(),
        ]);

        $newLabel = Contract::statusLabels()[$newStatus] ?? $newStatus;

        return back()->with('success', "Status kontrak {$contract->contract_number} berhasil diubah menjadi \"{$newLabel}\".");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Generate a unique contract number in format: SPK-YYYY-XXXXX
     */
    private function generateContractNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "SPK-{$year}-";

        do {
            $suffix = strtoupper(Str::random(5));
            $number = $prefix . $suffix;
        } while (Contract::where('contract_number', $number)->exists());

        return $number;
    }
}
