<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Funding;
use App\Models\Pembinaan;
use App\Models\University;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
                    'university' => [
                        'id' => $contract->university->id,
                        'name' => $contract->university->name,
                        'short_name' => $contract->university->short_name,
                        'code' => $contract->university->code,
                    ],
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
     * Generate (create) a new draft contract for a proposal.
     */
    public function generate(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        if (!auth()->user()->hasAnyRole([\App\Models\Role::SUPER_ADMIN, \App\Models\Role::ADMIN_KEUANGAN])) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'proposal_id'    => ['required', 'integer', 'exists:proposals,id', 'unique:contracts,proposal_id'],
            'title'          => ['required', 'string', 'max:255'],
            'contract_value' => ['required', 'numeric', 'min:0'],
            'party_1'        => ['required', 'string', 'max:255'],
            'party_2'        => ['required', 'string', 'max:255'],
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'description'    => ['nullable', 'string'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        $proposal = \App\Models\Proposal::with('user')->findOrFail($validated['proposal_id']);

        $contract = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $proposal, $request) {
            $year = now()->year;
            $prefix = "KON-{$year}-";
            $lastContract = Contract::withTrashed()
                ->where('contract_number', 'like', "{$prefix}%")
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();
            $sequence = $lastContract ? ((int) last(explode('-', $lastContract->contract_number))) + 1 : 1;
            $contractNumber = $prefix . str_pad((string)$sequence, 4, '0', STR_PAD_LEFT);

            return Contract::create([
                'university_id'   => $proposal->user->university_id ?? $request->user()->university_id,
                'proposal_id'     => $proposal->id,
                'contract_number' => $contractNumber,
                'title'           => $validated['title'],
                'description'     => $validated['description'] ?? null,
                'status'          => 'draft',
                'contract_value'  => $validated['contract_value'],
                'party_1'         => $validated['party_1'],
                'party_2'         => $validated['party_2'],
                'start_date'      => $validated['start_date'] ?? null,
                'end_date'        => $validated['end_date'] ?? null,
                'notes'           => $validated['notes'] ?? null,
                'created_by'      => $request->user()->id,
            ]);
        });

        return redirect()
            ->route('admin.contracts.show', $contract->id)
            ->with('success', "Draft kontrak {$contract->contract_number} berhasil dibuat.");
    }

    /**
     * Display the specified contract.
     */
    public function show(Contract $contract): Response
    {
        $user = auth()->user();
        if (!$user->hasAnyRole([\App\Models\Role::SUPER_ADMIN, \App\Models\Role::ADMIN_KEUANGAN])) {
            if ($user->hasRole(\App\Models\Role::ADMIN_KAMPUS)) {
                if ($contract->university_id !== $user->university_id) {
                    abort(403, 'Unauthorized access to this contract.');
                }
            } else {
                abort(403, 'Unauthorized access.');
            }
        }

        $contract->load([
            'proposal.user',
            'university',
            'creator',
            'updater',
        ]);

        return Inertia::render('Finance/Contract/Show', [
            'contract' => $contract,
        ]);
    }

    /**
     * Update contract status.
     */
    public function updateStatus(\Illuminate\Http\Request $request, Contract $contract): \Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();
        if (!$user->hasAnyRole([\App\Models\Role::SUPER_ADMIN, \App\Models\Role::ADMIN_KEUANGAN])) {
            if ($user->hasRole(\App\Models\Role::ADMIN_KAMPUS)) {
                if ($contract->university_id !== $user->university_id) {
                    abort(403, 'Unauthorized access to this contract.');
                }
            } else {
                abort(403, 'Unauthorized access.');
            }
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,completed,cancelled'],
            'notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        // Guard: terminal states cannot be changed
        if (in_array($contract->status, ['completed', 'cancelled'])) {
            return back()->with(
                'error',
                'Kontrak dengan status "Selesai" atau "Dibatalkan" tidak dapat diubah.'
            );
        }

        // Guard: only valid forward transitions
        $allowedTransitions = [
            'draft'  => ['active', 'cancelled'],
            'active' => ['completed', 'cancelled'],
        ];

        if (! in_array($validated['status'], $allowedTransitions[$contract->status] ?? [])) {
            return back()->with(
                'error',
                "Tidak dapat mengubah status dari \"{$contract->status}\" ke \"{$validated['status']}\"."
            );
        }

        $contract->update([
            'status'     => $validated['status'],
            'notes'      => $validated['notes'] ?? $contract->notes,
            'updated_by' => $user->id,
        ]);

        return back()->with(
            'success',
            "Status kontrak {$contract->contract_number} berhasil diubah ke \"{$validated['status']}\"."
        );
    }
}
