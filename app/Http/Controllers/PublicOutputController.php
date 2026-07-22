<?php

namespace App\Http\Controllers;

use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicOutputController extends Controller
{
    /**
     * Menampilkan detail luaran publik.
     */
    public function show($id)
    {
        // Mengambil data dengan kolom database resmi sesuai skema sistem
        $output = ResearchOutput::findOrFail($id);

        return Inertia::render('Public/OutputShow', [
            'output' => [
                'id' => $output->id,
                'judul_luaran' => $output->judul_luaran,           // Kolom resmi
                'jenis_luaran' => $output->jenis_luaran,           // Kolom resmi
                'status_verifikasi' => $output->status_verifikasi, // Kolom resmi
            ],
        ]);
    }

    /**
     * Pencarian luaran publik.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');

        $outputs = ResearchOutput::where('status_verifikasi', 'approved')
            ->when($query, function ($q) use ($query) {
                return $q->where('judul_luaran', 'like', "%{$query}%")
                    ->orWhere('jenis_luaran', 'like', "%{$query}%");
            })
            ->get();

        return response()->json($outputs);
    }
}
