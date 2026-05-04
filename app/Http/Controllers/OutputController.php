<?php

namespace App\Http\Controllers;

use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OutputController extends Controller
{
    public function index()
    {
        $outputs = ResearchOutput::with('user')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Output/Index', [
            'outputs' => $outputs,
        ]);
    }

    public function edit($id) 
    {
        try {
        
            $outputs = ResearchOutput::findOrFail($id);
            return Inertia::render('Output/Edit', [
                'output' => $outputs
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Output not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve output', 'error' => $e->getMessage()], 500);
        }

    }

    public function update(Request $request, $id)
    {
        try {

            $validated = $request->validate([
                'proposal_id' => 'required',
                'kategori' => 'required|string|max:255',
                'judul' => 'required|string|max:255',
                'file_path' => 'nullable|string|max:255',
                'status' => 'required|string|max:100',
                'keterangan' => 'nullable|string'
            ]);
            
            $output = ResearchOutput::findOrFail($id);
            $output->proposal_id = $validated['proposal_id'];
            $output->kategori = $validated['kategori'];
            $output->judul = $validated['judul'];
            $output->file_path = $validated['file_path'] ?? $output->file_path;
            $output->status = $validated['status'];
            $output->keterangan = $validated['keterangan'] ?? $output->keterangan;

            ResearchOutput::where('id', $id)->update($output->toArray());

            return Inertia::render('Output/Edit', [
                'message' => 'Output berhasil diupdate'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Output not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update output', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {

            $outputs = ResearchOutput::findOrFail($id);
            $outputs->delete();

            return Inertia::render('Output/Index', [
                'message' => 'Output deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Output not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete output', 'error' => $e->getMessage()], 500);
        }
    }


}
