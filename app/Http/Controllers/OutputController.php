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

    public function edit(ResearchOutput $output)
    {

        $this->authorize('update', $output);

        return Inertia::render('Output/Edit', [
            'outputs' => $output,
        ]);
    }

    public function update(Request $request, ResearchOutput $output)
    {

        $this->authorize('update', $output);

        $validated = $request->validate([
            'proposal_id' => 'required',
            'user_id' => 'required',
            'kategori' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'file_path' => 'nullable|string|max:255',
            'status' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $output->update($validated);

        return redirect()->route('outputs.index')->with('message', 'Output updated successfully');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        $output->delete();

        return redirect()->route('outputs.index')->with('message', 'Output deleted successfully');
    }
}
