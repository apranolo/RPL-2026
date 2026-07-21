<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Handle research output verification workflow for Super Admin.
 *
 * @route GET  /admin/output-verify          → index()
 * @route POST /admin/output-verify/{output}  → verify()
 *
 * @features List submitted outputs, approve/reject with notes
 */
class OutputVerifyCtrl extends Controller
{
    /**
     * Display a paginated list of research outputs awaiting admin verification.
     *
     * Only outputs with status "submitted" are shown by default.
     * Supports optional filters: search (judul), kategori, status.
     *
     * @route GET /admin/output-verify
     */
    public function index(Request $request)
    {
        $query = ResearchOutput::with(['user', 'proposal'])
            ->latest();

        // Default: show only submitted outputs, but allow filtering all statuses
        $status = $request->input('status', 'submitted');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Search by judul
        if ($search = $request->input('search')) {
            $query->where('judul', 'like', "%{$search}%");
        }

        // Filter by kategori
        if ($kategori = $request->input('kategori')) {
            $query->where('kategori', $kategori);
        }

        $outputs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Output/Index', [
            'outputs' => $outputs,
            'filters' => [
                'search' => $request->input('search', ''),
                'kategori' => $request->input('kategori', ''),
                'status' => $status,
            ],
            'kategoriOptions' => ResearchOutput::KATEGORI,
            'statusOptions' => ResearchOutput::STATUS,
        ]);
    }

    /**
     * Approve or reject a research output.
     *
     * Expects:
     *   - action: 'approved' | 'rejected'
     *   - keterangan: string (required when rejecting)
     *
     * @route POST /admin/output-verify/{output}
     */
    public function verify(Request $request, ResearchOutput $output)
    {
        $request->validate([
            'action' => 'required|in:approved,rejected',
            'keterangan' => 'required_if:action,rejected|nullable|string|max:1000',
        ], [
            'action.required' => 'Aksi verifikasi harus dipilih.',
            'action.in' => 'Aksi verifikasi tidak valid.',
            'keterangan.required_if' => 'Catatan penolakan wajib diisi.',
            'keterangan.max' => 'Catatan maksimal 1000 karakter.',
        ]);

        // Ensure output is in submitted status before verifying
        if ($output->status !== 'submitted') {
            return back()->with('error', 'Luaran ini tidak dalam status submitted dan tidak dapat diverifikasi.');
        }

        $action = $request->input('action');

        $output->update([
            'status' => $action,
            'keterangan' => $action === 'rejected'
                ? $request->input('keterangan')
                : $output->keterangan,
        ]);

        $message = $action === 'approved'
            ? "Luaran \"{$output->judul}\" berhasil disetujui."
            : "Luaran \"{$output->judul}\" ditolak.";

        return redirect()
            ->route('admin.output-verify.index')
            ->with('success', $message);
    }
}
