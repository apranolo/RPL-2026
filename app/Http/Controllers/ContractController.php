<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Funding;
use App\Models\Journal;
use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use App\Models\University;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ContractController
 *
 * Manages the lifecycle of contracts within the Finance module:
 *   index()        – Display contract management list
 *   generate()     – Create a new draft contract
 *   show()         – Display detail of a single contract
 *   updateStatus() – Transition contract status
 *
 * @author GILANG JA'FAR PRASETYA
 */
class ContractController extends Controller
{
    /**
     * Display contract management list for Admin Keuangan.
     */
    public function index(Request $request): Response
    {
        $baseQuery = Contract::query()
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $query->search($request->string('search')->toString());
            })
            ->when($request->filled('status'), function (Builder $query) use ($request) {
                $query->byStatus($request->string('status')->toString());
            })
            ->when($request->filled('university_id'), function (Builder $query) use ($request) {
                $query->where('university_id', $request->integer('university_id'));
            })
            ->when($request->filled('pembinaan_id'), function (Builder $query) use ($request) {
                $query->where('pembinaan_id', $request->integer('pembinaan_id'));
            });

        $contractValue = (float) (clone $baseQuery)->sum('contract_value');
        $totalContracts = (clone $baseQuery)->count();
        $disbursedValue = (float) Funding::query()
            ->whereIn('contract_id', (clone $baseQuery)->select('contracts.id'))
            ->disbursed()
            ->sum('amount');

        $contracts = $baseQuery
            ->with([
                'university:id,name,short_name,code',
                'pembinaan:id,name,category',
            ])
            ->withCount('fundings')
            ->withSum('fundings as funding_total', 'amount')
            ->withSum([
                'fundings as disbursed_total' => function (Builder $query) {
                    $query->where('status', Funding::STATUS_DISBURSED);
                },
            ], 'amount')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Contract $contract) {
                $contractValue = (float) $contract->contract_value;
                $disbursedTotal = (float) ($contract->disbursed_total ?? 0);

                return [
                    'id' => $contract->id,
                    'contract_number' => $contract->contract_number,
                    'title' => $contract->title,
                    'status' => $contract->status,
                    'status_label' => $contract->status_label,
                    'status_color' => $contract->status_color,
                    'contract_value' => $contractValue,
                    'party_1' => $contract->party_1,
                    'party_2' => $contract->party_2,
                    'funding_total' => (float) ($contract->funding_total ?? 0),
                    'disbursed_total' => $disbursedTotal,
                    'funding_progress' => $contractValue > 0
                        ? min(100, round(($disbursedTotal / $contractValue) * 100, 2))
                        : 0,
                    'fundings_count' => $contract->fundings_count,
                    'start_date' => $contract->start_date?->format('Y-m-d'),
                    'end_date' => $contract->end_date?->format('Y-m-d'),
                    'signed_at' => $contract->signed_at?->format('Y-m-d'),
                    'created_at' => $contract->created_at->format('Y-m-d'),
                    'university' => $contract->university ? [
                        'id' => $contract->university->id,
                        'name' => $contract->university->name,
                        'short_name' => $contract->university->short_name,
                        'code' => $contract->university->code,
                    ] : null,
                    'pembinaan' => $contract->pembinaan ? [
                        'id' => $contract->pembinaan->id,
                        'name' => $contract->pembinaan->name,
                        'category' => $contract->pembinaan->category,
                    ] : null,
                ];
            });

        return Inertia::render('Finance/Contract/Index', [
            'contracts' => $contracts,
            'filters' => $request->only(['search', 'status', 'university_id', 'pembinaan_id']),
            'summary' => [
                'total_contracts' => $totalContracts,
                'contract_value' => $contractValue,
                'disbursed_value' => $disbursedValue,
                'outstanding_value' => max($contractValue - $disbursedValue, 0),
            ],
            'universities' => University::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']),
            'pembinaanPrograms' => Pembinaan::query()
                ->orderByDesc('created_at')
                ->get(['id', 'name', 'category']),
            'statusOptions' => collect(Contract::getStatusOptions())
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values(),
        ]);
    }

    /**
     * Generate (create) a new draft contract.
     *
     * @route POST /admin/contracts/generate
     */
    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'pembinaan_registration_id' => ['nullable', 'integer', 'exists:pembinaan_registrations,id'],
            'journal_id' => ['nullable', 'integer', 'exists:journals,id'],
            'university_id' => ['nullable', 'integer', 'exists:universities,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'terms' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'contract_value' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['university_id'])) {
            if (! empty($validated['journal_id'])) {
                $journal = Journal::find($validated['journal_id']);
                $validated['university_id'] = $journal?->university_id;
            } elseif (! empty($validated['pembinaan_registration_id'])) {
                $registration = PembinaanRegistration::with('journal')->find(
                    $validated['pembinaan_registration_id']
                );
                $validated['university_id'] = $registration?->journal?->university_id;
            } else {
                $validated['university_id'] = $request->user()->university_id ?? University::first()?->id ?? 1;
            }
        }

        $contract = DB::transaction(function () use ($validated, $request) {
            $year = date('Y');
            $prefix = "KON-{$year}-";
            $lastContract = Contract::where('contract_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $nextSequence = 1;
            if ($lastContract && preg_match('/-(\d+)$/', $lastContract->contract_number, $matches)) {
                $nextSequence = (int) $matches[1] + 1;
            }
            $contractNumber = sprintf('%s%04d', $prefix, $nextSequence);

            return Contract::create([
                'contract_number' => $contractNumber,
                'title' => $validated['title'],
                'pembinaan_registration_id' => $validated['pembinaan_registration_id'] ?? null,
                'journal_id' => $validated['journal_id'] ?? null,
                'university_id' => $validated['university_id'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'terms' => $validated['terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'contract_value' => $validated['contract_value'] ?? 0,
                'status' => 'draft',
                'created_by' => $request->user()->id,
            ]);
        });

        return redirect()->route('admin.contracts.show', $contract->id)
            ->with('success', "Draft kontrak \"{$contract->title}\" ({$contract->contract_number}) berhasil dibuat.");
    }

    /**
     * Display the specified contract detail.
     */
    public function show(Contract $contract): Response
    {
        $this->authorizeContractAccess($contract);

        $contract->load([
            'university',
            'journal',
            'pembinaanRegistration',
            'creator',
            'updater',
        ]);

        return Inertia::render('Finance/Contract/Show', [
            'contract' => [
                'id' => $contract->id,
                'contract_number' => $contract->contract_number,
                'title' => $contract->title,
                'status' => $contract->status,
                'status_label' => $contract->getStatusLabelAttribute(),
                'status_color' => $contract->getStatusColorAttribute(),
                'start_date' => $contract->start_date?->format('Y-m-d'),
                'end_date' => $contract->end_date?->format('Y-m-d'),
                'terms' => $contract->terms,
                'notes' => $contract->notes,
                'contract_value' => (float) $contract->contract_value,
                'university' => $contract->university ? [
                    'id' => $contract->university->id,
                    'name' => $contract->university->name,
                ] : null,
                'journal' => $contract->journal ? [
                    'id' => $contract->journal->id,
                    'title' => $contract->journal->title,
                ] : null,
                'creator' => $contract->creator ? [
                    'id' => $contract->creator->id,
                    'name' => $contract->creator->name,
                ] : null,
                'created_at' => $contract->created_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update status of contract.
     */
    public function updateStatus(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorizeContractAccess($contract);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:draft,active,selesai,dibatalkan'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (in_array($contract->status, ['selesai', 'dibatalkan', 'completed', 'cancelled'])) {
            return back()->with('error', 'Kontrak dalam status terminal tidak dapat diubah lagi.');
        }

        if ($contract->status === 'draft' && $validated['status'] === 'selesai') {
            return back()->with('error', 'Draft kontrak tidak dapat langsung diubah menjadi selesai.');
        }

        $contract->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $contract->notes,
            'updated_by' => $request->user()->id,
        ]);

        return back()->with('success', "Status kontrak {$contract->contract_number} berhasil diubah.");
    }

    private function authorizeContractAccess(Contract $contract): void
    {
        $user = auth()->user();
        if ($user && method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return;
        }

        if ($contract->university_id !== null && $user && $user->university_id !== $contract->university_id) {
            abort(403, 'Anda tidak memiliki akses ke kontrak ini.');
        }
    }
}
