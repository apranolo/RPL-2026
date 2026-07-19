<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Journal;
use App\Models\PembinaanRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ContractController
 *
 * Manages the lifecycle of contracts within the Finance module:
 *   generate()     – Create a new draft contract (with optional links to journal / pembinaan registration)
 *   show()         – Display detail of a single contract
 *   updateStatus() – Transition contract status (draft → active → selesai / dibatalkan)
 *
 * Multi-tenancy note:
 *   All mutating actions validate that the acting user belongs to the same
 *   university as the contract (unless the user is Super Admin). This prevents
 *   cross-tenant data leakage (ID harvesting).
 *
 * @author GILANG JA'FAR PRASETYA
 */
class ContractController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | generate()
    |--------------------------------------------------------------------------
    |
    | Creates a new contract in "draft" status.
    |
    | The method:
    |   1. Validates the incoming request payload.
    |   2. Auto-infers university from linked journal / pembinaan registration.
    |   3. Auto-generates a sequential contract number inside a DB transaction
    |      (using SELECT … FOR UPDATE to prevent race conditions).
    |   4. Persists the draft contract and redirects to its detail page.
    |
    | Route (example): POST /admin/contracts/generate
    |
    */

    /**
     * Generate (create) a new draft contract.
     *
     * @route POST /admin/contracts/generate
     */
    public function generate(Request $request): RedirectResponse
    {
        // ------------------------------------------------------------------
        // 1. Validate input
        // ------------------------------------------------------------------
        $validated = $request->validate([
            // Required
            'title' => ['required', 'string', 'max:255'],

            // Optional relational links
            'pembinaan_registration_id' => ['nullable', 'integer', 'exists:pembinaan_registrations,id'],
            'journal_id' => ['nullable', 'integer', 'exists:journals,id'],
            'university_id' => ['nullable', 'integer', 'exists:universities,id'],

            // Optional contract period
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],

            // Optional body content
            'terms' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],

            // Financial fields (PRD Modul 3 – Keuangan)
            'contract_value' => ['nullable', 'integer', 'min:0'],
        ]);

        // ------------------------------------------------------------------
        // 2. Auto-infer university from related journal / pembinaan registration
        //    when not explicitly provided
        // ------------------------------------------------------------------
        if (empty($validated['university_id'])) {
            if (! empty($validated['journal_id'])) {
                $journal = Journal::find($validated['journal_id']);
                $validated['university_id'] = $journal?->university_id;
            } elseif (! empty($validated['pembinaan_registration_id'])) {
                $registration = PembinaanRegistration::with('journal')->find(
                    $validated['pembinaan_registration_id']
                );
                $validated['university_id'] = $registration?->journal?->university_id;
            }
        }

        // ------------------------------------------------------------------
        // 3. Create the draft contract inside a transaction so that the
        //    contract-number generation is atomic (no duplicate numbers).
        // ------------------------------------------------------------------
        $contract = DB::transaction(function () use ($validated, $request) {
            $contractNumber = Contract::generateContractNumber();

            return Contract::create([
                'contract_number' => $contractNumber,
                'title' => $validated['title'],
                'pembinaan_registration_id' => $validated['pembinaan_registration_id'] ?? null,
                'journal_id' => $validated['journal_id'] ?? null,
                'university_id' => $validated['university_id'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'status' => 'draft',
                'terms' => $validated['terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'contract_value' => $validated['contract_value'] ?? null,
                'created_by' => $request->user()->id,
            ]);
        });

        // ------------------------------------------------------------------
        // 4. Redirect to the contract detail page with a success flash
        //    [FIX] Route name corrected from 'contracts.show' to
        //    'admin.contracts.show' to match the named-prefix group in web.php.
        // ------------------------------------------------------------------
        return redirect()
            ->route('admin.contracts.show', $contract)
            ->with('success', "Draft kontrak {$contract->contract_number} berhasil dibuat.");
    }

    /*
    |--------------------------------------------------------------------------
    | show()
    |--------------------------------------------------------------------------
    */

    /**
     * Display the specified contract.
     *
     * Multi-tenancy guard:
     *   Non-super-admin users may only view contracts whose university_id
     *   matches their own, preventing cross-tenant ID harvesting.
     *
     * @route GET /admin/contracts/{contract}
     */
    public function show(Contract $contract): Response
    {
        // [SECURITY] Enforce university scoping for non-super-admin users.
        $this->authorizeContractAccess($contract);

        $contract->load([
            'pembinaanRegistration.journal.university',
            'pembinaanRegistration.pembinaan',
            'journal.university',
            'university',
            'creator',
            'updater',
        ]);

        return Inertia::render('Finance/Contract/Show', [
            'contract' => $contract,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | updateStatus()
    |--------------------------------------------------------------------------
    */

    /**
     * Update contract status.
     *
     * Allowed transitions:
     *   draft       → active | dibatalkan
     *   active      → selesai | dibatalkan
     *   selesai     → (terminal – no transition)
     *   dibatalkan  → (terminal – no transition)
     *
     * Multi-tenancy guard:
     *   Non-super-admin users may only mutate contracts belonging to their
     *   own university.
     *
     * @route POST /admin/contracts/{contract}/update-status
     */
    public function updateStatus(Request $request, Contract $contract): RedirectResponse
    {
        // [SECURITY] Enforce university scoping for non-super-admin users.
        $this->authorizeContractAccess($contract);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,selesai,dibatalkan'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Guard: terminal states cannot be changed
        if (in_array($contract->status, ['selesai', 'dibatalkan'])) {
            return back()->with(
                'error',
                'Kontrak dengan status "'.$contract->getStatusLabelAttribute().'" tidak dapat diubah.'
            );
        }

        // Guard: only valid forward transitions
        $allowedTransitions = [
            'draft' => ['active', 'dibatalkan'],
            'active' => ['selesai', 'dibatalkan'],
        ];

        if (! in_array($validated['status'], $allowedTransitions[$contract->status] ?? [])) {
            return back()->with(
                'error',
                "Tidak dapat mengubah status dari \"{$contract->getStatusLabelAttribute()}\" ke \"{$validated['status']}\"."
            );
        }

        $contract->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $contract->notes,
            'updated_by' => $request->user()->id,
        ]);

        return back()->with(
            'success',
            "Status kontrak {$contract->contract_number} berhasil diubah ke \"{$contract->fresh()->getStatusLabelAttribute()}\"."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Enforce multi-tenancy authorization on a contract.
     *
     * Super Admins bypass this check (they manage all universities).
     * Other roles must share the same university_id as the contract.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    private function authorizeContractAccess(Contract $contract): void
    {
        $user = auth()->user();

        // Super Admin can access any contract across all universities.
        if ($user->isSuperAdmin()) {
            return;
        }

        // For all other roles, enforce university boundary.
        if ($contract->university_id !== null && $user->university_id !== $contract->university_id) {
            abort(403, 'Anda tidak memiliki akses ke kontrak ini.');
        }
    }
}
