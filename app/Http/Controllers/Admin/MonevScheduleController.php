<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonevSchedule;
use Illuminate\Http\Request;

class MonevScheduleController extends Controller
{
    /**
     * Menampilkan semua jadwal monev
     */
    public function index()
    {
        $monevSchedules = MonevSchedule::all();

        return response()->json($monevSchedules);
    }

    /**
     * Menyimpan jadwal monev baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'research_id' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required',
        ]);

        $monevSchedule = MonevSchedule::create([
            'research_id' => $request->research_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Jadwal monev berhasil dibuat',
            'data' => $monevSchedule,
        ]);
    }

    /**
     * Update jadwal monev
     */
    public function update(Request $request, $id)
    {
        $monevSchedule = MonevSchedule::findOrFail($id);

        $monevSchedule->update($request->all());

        return response()->json([
            'message' => 'Jadwal monev berhasil diupdate',
            'data' => $monevSchedule,
        ]);
    }

    /**
     * Hapus jadwal monev
     */
    public function destroy($id)
    {
        $monevSchedule = MonevSchedule::findOrFail($id);

        $monevSchedule->delete();

        return response()->json([
            'message' => 'Jadwal monev berhasil dihapus',
        ]);
    }
}
