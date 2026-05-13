<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Inertia\Inertia;
use Inertia\Response;

class ProposalController extends Controller
{
    /**
     * Menampilkan semua proposal dari seluruh universitas (Super Admin)
     */
    public function index(): Response
    {
        $proposals = Proposal::with(['user', 'university'])
            ->latest()
            ->get()
            ->map(fn($proposal) => [
                'id'          => $proposal->id,
                'judul'       => $proposal->judul,
                'abstrak'     => $proposal->abstrak,
                'status'      => $proposal->status,
                'tahun'       => $proposal->tahun,
                'user'        => [
                    'id'   => $proposal->user?->id,
                    'name' => $proposal->user?->name,
                    'email'=> $proposal->user?->email,
                ],
                'university'  => [
                    'id'   => $proposal->university?->id,
                    'name' => $proposal->university?->name,
                ],
                'created_at'  => $proposal->created_at?->format('d M Y'),
            ]);

        return Inertia::render('Admin/Proposal/Index', [
            'proposals' => $proposals,
        ]);
    }
}