<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMonevScheduleRequest;
use App\Models\Contract;
use App\Models\MonevSchedule;
use App\Models\ProgressReport;
use App\Models\User;
use Inertia\Inertia;

class MonevScheduleCtrl extends Controller
{
    /**
     * Display a listing of monev schedules.
     */
    public function index()
    {
        return Inertia::render('Admin/Monev/Schedule', array_merge(
            $this->getMonevData(),
            ['activeTab' => 'schedules'],
        ));
    }

    /**
     * Store a newly created monev schedule.
     */
    public function store(StoreMonevScheduleRequest $request)
    {
        MonevSchedule::create($request->validated());

        return redirect()->route('admin.monev-schedules.index')
            ->with('success', 'Jadwal monev berhasil dibuat.');
    }

    /**
     * Display the list of pending progress reports that have not been reviewed.
     */
    public function pending()
    {
        $universityId = auth()->user()->university_id;

        $pendingQuery = ProgressReport::where('status', 'submitted')
            ->with(['proposal.user', 'user']);

        if ($universityId) {
            $pendingQuery->whereHas('proposal.user', function ($q) use ($universityId) {
                $q->where('university_id', $universityId);
            });
        }

        return Inertia::render('Admin/Monev/Schedule', array_merge(
            $this->getMonevData(),
            [
                'pendingReports' => $pendingQuery->get(),
                'activeTab' => 'pending',
            ],
        ));
    }

    /**
     * Get shared monev data (schedules, contracts, evaluators) with multi-tenancy filtering.
     */
    private function getMonevData(): array
    {
        $universityId = auth()->user()->university_id;

        $schedulesQuery = MonevSchedule::with(['contract.proposal.user', 'evaluator']);
        $contractsQuery = Contract::with('proposal.user');
        $evaluatorsQuery = User::where('is_reviewer', true);

        if ($universityId) {
            $schedulesQuery->whereHas('contract', function ($q) use ($universityId) {
                $q->where('university_id', $universityId);
            })->orWhereNull('contract_id');

            $contractsQuery->where('university_id', $universityId);
            $evaluatorsQuery->where('university_id', $universityId);
        }

        return [
            'schedules' => $schedulesQuery->get(),
            'contracts' => $contractsQuery->get(),
            'evaluators' => $evaluatorsQuery->get(),
        ];
    }
}
