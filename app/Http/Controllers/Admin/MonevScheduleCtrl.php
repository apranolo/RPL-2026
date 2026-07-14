<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonevSchedule;
use App\Models\Contract;
use App\Models\ProgressReport;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonevScheduleCtrl extends Controller
{
    /**
     * Display a listing of monev schedules.
     */
    public function index()
    {
        $schedules = MonevSchedule::with(['contract.proposal.user', 'evaluator'])->get();
        $contracts = Contract::with('proposal.user')->get();
        $evaluators = User::where('is_reviewer', true)->get();

        return Inertia::render('Admin/Monev/Schedule', [
            'schedules' => $schedules,
            'contracts' => $contracts,
            'evaluators' => $evaluators,
            'activeTab' => 'schedules',
        ]);
    }

    /**
     * Store a newly created monev schedule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|integer',
            'evaluator_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'nullable|string',
            'location' => 'nullable|string',
            'status' => 'nullable|in:scheduled,done,cancelled',
        ]);

        MonevSchedule::create($validated);

        return redirect()->route('admin.monev-schedules.index')
            ->with('success', 'Jadwal monev berhasil dibuat.');
    }

    /**
     * Display the list of pending progress reports that have not been reviewed.
     */
    public function pending()
    {
        $pendingReports = ProgressReport::where('status', 'submitted')
            ->with(['proposal.user', 'user'])
            ->get();

        $schedules = MonevSchedule::with(['contract.proposal.user', 'evaluator'])->get();
        $contracts = Contract::with('proposal.user')->get();
        $evaluators = User::where('is_reviewer', true)->get();

        return Inertia::render('Admin/Monev/Schedule', [
            'pendingReports' => $pendingReports,
            'schedules' => $schedules,
            'contracts' => $contracts,
            'evaluators' => $evaluators,
            'activeTab' => 'pending',
        ]);
    }
}
