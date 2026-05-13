<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonevSchedule;
use Illuminate\Http\Request;

class MonevScheduleCtrl extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|integer',
            'evaluator_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'nullable',
            'location' => 'nullable|string',
        ]);

        MonevSchedule::create($validated);

        return redirect()->back()->with(
            'success',
            'Jadwal monev berhasil dibuat'
        );
    }

    public function pending()
    {
        $pendingSchedules = MonevSchedule::where('status', 'scheduled')
            ->get();

        return view('admin.monev-schedule.pending', [
    'schedules' => $pendingSchedules,
]);
    }
}