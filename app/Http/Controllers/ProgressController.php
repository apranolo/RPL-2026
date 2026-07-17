<?php

namespace App\Http\Controllers;

use App\Models\ProgressReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    /**
     * Show the form for creating a new laporan kemajuan.
     *
     * @route GET /dosen/progress/create
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Progress/Create', [
            'user' => $user->only('id', 'name', 'email'),
        ]);
    }

    /**
     * Store a newly created laporan kemajuan in storage.
     *
     * Handles:
     * - Validation of form fields (judul, deskripsi, periode, catatan, dll.)
     * - Upload dokumen laporan (PDF/DOCX)
     * - Upload file logbook (opsional)
     * - Penyimpanan data ke tabel progress_reports
     *
     * @route POST /dosen/progress
     */
    public function store(\App\Http\Requests\StoreProgressReportRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $user = $request->user();

            // Upload dokumen laporan (opsional)
            $dokumenLaporanPath = null;
            if ($request->hasFile('dokumen_laporan')) {
                $file     = $request->file('dokumen_laporan');
                $fileName = time() . '_laporan_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $dokumenLaporanPath = $file->storeAs('progress_reports/dokumen', $fileName, 'public');
            }

            // Upload file logbook (opsional)
            $logbookPath = null;
            if ($request->hasFile('logbook')) {
                $file     = $request->file('logbook');
                $fileName = time() . '_logbook_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $logbookPath = $file->storeAs('progress_reports/logbook', $fileName, 'public');
            }

            // Buat record laporan kemajuan
            $progress = ProgressReport::create([
                'user_id'           => $user->id,
                'judul'             => $validated['judul'],
                'periode'           => $validated['periode'],
                'tanggal_laporan'   => $validated['tanggal_laporan'],
                'deskripsi'         => $validated['deskripsi'],
                'catatan'           => $validated['catatan'] ?? null,
                'status'            => $validated['status'] ?? 'draft',
                'dokumen_laporan'   => $dokumenLaporanPath,
                'logbook'           => $logbookPath,
            ]);

            DB::commit();

            return redirect()
                ->route('progress.show', $progress->id)
                ->with('success', 'Laporan kemajuan berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollBack();

            // Hapus file yang sudah terupload jika terjadi error
            if (isset($dokumenLaporanPath) && $dokumenLaporanPath) {
                Storage::disk('public')->delete($dokumenLaporanPath);
            }
            if (isset($logbookPath) && $logbookPath) {
                Storage::disk('public')->delete($logbookPath);
            }

            Log::error('Gagal menyimpan laporan kemajuan', [
                'user_id'   => $request->user()?->id,
                'exception' => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal menyimpan laporan kemajuan. Silakan coba lagi atau hubungi administrator.']);
        }
    }

    /**
     * Display the specified laporan kemajuan.
     *
     * @route GET /dosen/progress/{progress}
     */
    public function show(ProgressReport $progress): Response
    {
        $this->authorize('view', $progress);

        return Inertia::render('Progress/Show', [
            'progress' => $progress,
        ]);
    }

    /**
     * Display a listing of progress reports for the authenticated user (Dosen).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = ProgressReport::where('user_id', $user->id)
            ->with(['proposal', 'contract', 'evaluations.reviewer']);

        // Search by title
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by report type
        if ($reportType = $request->input('report_type')) {
            $query->where('report_type', $reportType);
        }

        $progressReports = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Progress/Index', [
            'progressReports' => $progressReports,
            'filters' => $request->only(['search', 'status', 'report_type']),
        ]);
    }
}
