<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ProgressReport;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProgressController extends Controller
{
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

    /**
     * Show the form for creating a new progress report.
     */
    public function create()
    {
        $proposals = Proposal::where('user_id', Auth::id())
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Progress/Create', [
            'proposals' => $proposals,
        ]);
    }

    /**
     * Store a newly created progress report.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'proposal_id' => [
                'required',
                Rule::exists('proposals', 'id')->where('user_id', $user->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'report_type' => ['required', Rule::in(['logbook', 'laporan_kemajuan', 'laporan_akhir'])],
            'report_date' => ['required', 'date'],
            'progress_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'report_period' => ['required', 'string', 'max:255'],
            'attachment' => ['required_unless:report_type,logbook', 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'status' => ['required', Rule::in(['draft', 'submitted'])],
        ], [
            'proposal_id.required' => 'Proposal wajib dipilih.',
            'title.required' => 'Judul laporan wajib diisi.',
            'content.required' => 'Deskripsi kegiatan wajib diisi.',
            'report_type.required' => 'Jenis laporan wajib dipilih.',
            'report_date.required' => 'Tanggal pelaporan wajib diisi.',
            'progress_percentage.min' => 'Nilai progres harus antara rentang 0 hingga 100.',
            'progress_percentage.max' => 'Nilai progres harus antara rentang 0 hingga 100.',
            'attachment.required_unless' => 'Bukti file dokumentasi laporan wajib dilampirkan.',
            'attachment.max' => 'Dokumen lampiran maksimal 5MB.',
        ]);

        // Validasi logis (PRD Modul 4): progres tidak boleh mundur dari laporan sebelumnya
        $lastPercentage = ProgressReport::where('user_id', $user->id)
            ->where('proposal_id', $validated['proposal_id'])
            ->max('progress_percentage');

        if ($lastPercentage !== null && $validated['progress_percentage'] < $lastPercentage) {
            return back()->withErrors([
                'progress_percentage' => "Persentase progres tidak boleh lebih kecil dari laporan sebelumnya ({$lastPercentage}%).",
            ])->withInput();
        }

        // Ambil kontrak yang terhubung dengan proposal (jika sudah ada)
        $contract = Contract::where('proposal_id', $validated['proposal_id'])->first();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('progress-attachments', 'public');
        }

        ProgressReport::create([
            'proposal_id' => $validated['proposal_id'],
            'contract_id' => $contract?->id,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'report_type' => $validated['report_type'],
            'report_date' => $validated['report_date'],
            'progress_percentage' => $validated['progress_percentage'],
            'report_period' => $validated['report_period'],
            'attachment_path' => $attachmentPath,
            'status' => $validated['status'],
            'submitted_at' => $validated['status'] === 'submitted' ? now() : null,
        ]);

        return redirect()
            ->route('user.progress.index')
            ->with('success', 'Laporan kemajuan berhasil disimpan.');
    }

    /**
     * Display the specified progress report.
     */
    public function show(ProgressReport $progressReport)
    {
        abort_if($progressReport->user_id !== Auth::id(), 403);

        $progressReport->load(['proposal', 'contract', 'evaluations.reviewer']);

        return Inertia::render('Progress/Show', [
            'progressReport' => $progressReport,
        ]);
    }
}
