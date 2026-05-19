<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Journal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ContractController extends Controller
{
    /**
     * Display a listing of all contracts.
     *
     * @route GET /finance/contracts
     */
    public function index(Request $request): Response
    {
        $contracts = Contract::query()
            ->with(['journal:id,title,issn', 'user:id,name', 'generator:id,name'])
            ->when($request->status, fn ($q, $status) => $q->byStatus($status))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('contract_number', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhereHas('journal', fn ($j) => $j->where('title', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($contract) => $contract->append(['status_label', 'status_color']));

        return Inertia::render('Finance/Contract/Index', [
            'contracts' => $contracts,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified contract.
     *
     * @route GET /finance/contracts/{contract}
     */
    public function show(Contract $contract): Response
    {
        $contract->load([
            'journal.university',
            'user',
            'generator',
        ]);

        $contract->append(['status_label', 'status_color']);

        return Inertia::render('Finance/Contract/Show', [
            'contract' => $contract,
        ]);
    }

    /**
     * Generate a draft contract for a given journal/user.
     *
     * Creates a new contract in "draft" status, auto-assigning a unique
     * contract number. Only one active draft per journal is allowed.
     *
     * @route POST /finance/contracts/generate
     */
    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'journal_id' => 'required|exists:journals,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Ensure the journal exists and retrieve its owner
        $journal = Journal::findOrFail($validated['journal_id']);

        // Prevent duplicate draft contracts for the same journal
        $existingDraft = Contract::where('journal_id', $journal->id)
            ->where('status', 'draft')
            ->exists();

        if ($existingDraft) {
            return back()->withErrors([
                'journal_id' => 'Jurnal ini sudah memiliki kontrak draft yang belum difinalisasi.',
            ]);
        }

        DB::beginTransaction();
        try {
            $contract = Contract::create([
                'journal_id' => $journal->id,
                'user_id' => $journal->user_id,
                'contract_number' => Contract::generateContractNumber(),
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'value' => $validated['value'] ?? null,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => 'draft',
                'generated_at' => now(),
                'generated_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            return redirect()
                ->route('finance.contracts.show', $contract->id)
                ->with('success', "Draft kontrak \"{$contract->contract_number}\" berhasil dibuat.");

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('ContractController@generate: Gagal membuat draft kontrak.', [
                'user_id' => $request->user()->id,
                'journal_id' => $validated['journal_id'] ?? null,
                'exception' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Gagal membuat draft kontrak. Silakan coba lagi atau hubungi administrator.',
            ]);
        }
    }

    /**
     * Update the status of a contract (Aktif / Selesai / Batal).
     *
     * Valid transitions:
     *   draft   → aktif
     *   aktif   → selesai | batal
     *   selesai → (terminal — no further transitions)
     *   batal   → (terminal — no further transitions)
     *
     * @route PATCH /finance/contracts/{contract}/status
     */
    public function updateStatus(Request $request, Contract $contract): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:aktif,selesai,batal',
            'notes' => 'nullable|string|max:1000',
        ]);

        $newStatus = $validated['status'];

        // Guard: reject terminal contracts
        if (in_array($contract->status, ['selesai', 'batal'])) {
            return back()->withErrors([
                'status' => "Kontrak dengan status \"{$contract->status_label}\" tidak dapat diubah lagi.",
            ]);
        }

        // Guard: allowed transitions
        $allowedTransitions = [
            'draft' => ['aktif'],
            'aktif' => ['selesai', 'batal'],
        ];

        $allowed = $allowedTransitions[$contract->status] ?? [];

        if (! in_array($newStatus, $allowed)) {
            return back()->withErrors([
                'status' => "Status tidak dapat diubah dari \"{$contract->status_label}\" ke \"{$newStatus}\".",
            ]);
        }

        try {
            $contract->update([
                'status' => $newStatus,
                'notes' => $validated['notes'] ?? $contract->notes,
            ]);

            $newLabel = Contract::getStatusOptions()[$newStatus] ?? $newStatus;

            return back()->with('success', "Status kontrak berhasil diubah menjadi \"{$newLabel}\".");

        } catch (\Exception $e) {
            Log::error('ContractController@updateStatus: Gagal mengubah status kontrak.', [
                'contract_id' => $contract->id,
                'user_id' => $request->user()->id,
                'new_status' => $newStatus,
                'exception' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Gagal mengubah status kontrak. Silakan coba lagi atau hubungi administrator.',
            ]);
        }
    }

    /**
     * Delete a contract (only allowed for draft status).
     *
     * @route DELETE /finance/contracts/{contract}
     */
    public function destroy(Request $request, Contract $contract): RedirectResponse
    {
        if (! $contract->isDraft()) {
            return back()->withErrors([
                'error' => 'Hanya kontrak berstatus draft yang dapat dihapus.',
            ]);
        }

        try {
            $contractNumber = $contract->contract_number;
            $contract->delete();

            return redirect()
                ->route('finance.contracts.index')
                ->with('success', "Kontrak \"{$contractNumber}\" berhasil dihapus.");

        } catch (\Exception $e) {
            Log::error('ContractController@destroy: Gagal menghapus kontrak.', [
                'contract_id' => $contract->id,
                'user_id' => $request->user()->id,
                'exception' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Gagal menghapus kontrak. Silakan coba lagi atau hubungi administrator.',
            ]);
        }
    }
}
