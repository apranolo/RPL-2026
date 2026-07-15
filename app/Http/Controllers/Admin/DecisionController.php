<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use App\Models\Proposal;
use App\Notifications\AssessmentApprovedNotification;
use App\Notifications\AssessmentRevisionRequestedNotification;
use App\Services\ReviewCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * DecisionController
 *
 * Menangani penentuan status Diterima/Ditolak (Accepted/Rejected)
 * untuk Proposal Penelitian dan Penilaian Jurnal (JournalAssessment).
 *
 * @author FAHMI HIDAYAT
 */
class DecisionController extends Controller
{
    /**
     * Layanan kalkulasi statistik review.
     */
    protected ReviewCalculationService $calculationService;

    /**
     * Pembuatan instance controller baru.
     */
    public function __construct(ReviewCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * Memproses keputusan Diterima atau Ditolak.
     *
     * @route POST /admin/decision/decide
     */
    public function decide(Request $request)
    {
        // 1. Validasi Input Utama
        $validated = $request->validate([
            'type' => 'required|string|in:proposal,assessment',
            'id' => 'required|integer',
            'decision' => 'required|string|in:approved,rejected,diterima,ditolak',
            'reason' => 'required_if:decision,rejected,ditolak|nullable|string|min:10|max:1000',
        ], [
            'type.required' => 'Tipe penentuan harus diisi.',
            'type.in' => 'Tipe penentuan harus berupa proposal atau assessment.',
            'id.required' => 'ID target harus diisi.',
            'decision.required' => 'Keputusan harus ditentukan.',
            'decision.in' => 'Keputusan harus berupa diterima (approved) atau ditolak (rejected).',
            'reason.required_if' => 'Alasan penolakan wajib diisi jika keputusan ditolak.',
            'reason.min' => 'Alasan penolakan minimal 10 karakter.',
            'reason.max' => 'Alasan penolakan maksimal 1000 karakter.',
        ]);

        $user = auth()->user();

        // 2. Verifikasi Peran Keamanan Dasar (Super Admin & Admin Kampus)
        if (! $user->isSuperAdmin() && ! $user->isAdminKampus()) {
            abort(403, 'Aksi ini tidak diizinkan untuk peran pengguna Anda.');
        }

        $type = $validated['type'];
        $targetId = $validated['id'];
        $decision = strtolower($validated['decision']);
        $reason = $validated['reason'] ?? null;

        // Normalisasi status ke boolean/string yang konsisten
        $isApproved = in_array($decision, ['approved', 'diterima']);

        return DB::transaction(function () use ($type, $targetId, $isApproved, $reason, $user) {
            if ($type === 'proposal') {
                return $this->handleProposalDecision($targetId, $isApproved, $reason, $user);
            } else {
                return $this->handleAssessmentDecision($targetId, $isApproved, $reason, $user);
            }
        });
    }

    /**
     * Memproses keputusan untuk Proposal.
     */
    protected function handleProposalDecision(int $id, bool $isApproved, ?string $reason, $user)
    {
        $proposal = Proposal::with('user')->findOrFail($id);

        // Otorisasi: Admin Kampus hanya bisa memproses proposal dosen dari universitasnya sendiri
        if ($user->isAdminKampus() && $proposal->user->university_id !== $user->university_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk memproses proposal dari universitas lain.');
        }

        $status = $isApproved ? 'Diterima' : 'Ditolak';

        $proposal->update([
            'status_proposal' => $status,
            'rejection_reason' => $isApproved ? null : $reason,
        ]);

        $message = "Proposal '{$proposal->judul}' berhasil ditandai sebagai {$status}.";

        return back()->with('success', $message);
    }

    /**
     * Memproses keputusan untuk JournalAssessment.
     */
    protected function handleAssessmentDecision(int $id, bool $isApproved, ?string $reason, $user)
    {
        $assessment = JournalAssessment::with(['journal', 'user'])->findOrFail($id);

        // Otorisasi: Admin Kampus hanya bisa memproses assessment jurnal dari universitasnya sendiri
        if ($user->isAdminKampus() && $assessment->journal->university_id !== $user->university_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk memproses penilaian dari universitas lain.');
        }

        if ($isApproved) {
            // Sinkronisasi nilai akhir menggunakan ReviewCalculationService sebelum disimpan
            $metrics = $this->calculationService->calculateSingle($assessment);

            $assessment->update([
                'status' => 'reviewed',
                'total_score' => $metrics['total_score'],
                'max_score' => $metrics['max_score'],
                'percentage' => $metrics['percentage'],
                'admin_kampus_approved_by' => $user->id,
                'admin_kampus_approved_at' => now(),
                'admin_kampus_approval_notes' => $reason ?? 'Assessment disetujui oleh LPPM/Admin.',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            // Catatan Riwayat Aksi (Timeline Log)
            $assessment->assessmentNotes()->create([
                'user_id' => $user->id,
                'author_role' => $user->isSuperAdmin() ? 'Super Admin' : 'Admin Kampus',
                'note_type' => 'approval',
                'content' => $reason ?? 'Assessment disetujui.',
            ]);

            // Kirim Notifikasi Persetujuan
            $assessment->user->notify(new AssessmentApprovedNotification($assessment, $reason ?? 'Assessment disetujui.'));

            $message = "Assessment jurnal '{$assessment->journal->title}' berhasil disetujui.";
        } else {
            // Jika ditolak, status dikembalikan menjadi draft untuk direvisi
            $assessment->update([
                'status' => 'draft',
                'admin_kampus_approved_by' => $user->id,
                'admin_kampus_approved_at' => now(),
                'admin_kampus_approval_notes' => $reason,
            ]);

            // Catatan Riwayat Aksi (Timeline Log)
            $assessment->assessmentNotes()->create([
                'user_id' => $user->id,
                'author_role' => $user->isSuperAdmin() ? 'Super Admin' : 'Admin Kampus',
                'note_type' => 'rejection',
                'content' => $reason,
            ]);

            // Kirim Notifikasi Revisi/Penolakan
            $assessment->user->notify(new AssessmentRevisionRequestedNotification($assessment, $reason));

            $message = "Assessment jurnal '{$assessment->journal->title}' telah ditolak untuk direvisi.";
        }

        return back()->with('success', $message);
    }
}
