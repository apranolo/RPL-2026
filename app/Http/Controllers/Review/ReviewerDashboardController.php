<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Class ReviewerDashboardController
 *
 * Mengelola tampilan dashboard reviewer, termasuk daftar tugas review aktif.
 */
class ReviewerDashboardController extends Controller
{
    /**
     * Menampilkan daftar tugas review aktif milik reviewer yang sedang login.
     *
     * Mengambil semua assignment dengan status 'assigned', 'Accepted' atau 'in_progress'
     * beserta relasi submission, journal, dan assigner
     * yang dimiliki oleh reviewer yang sedang terautentikasi.
     */
    public function index()
    {
        $reviewerId = Auth::id();

        // Ambil semua tugas review aktif (assigned, Accepted, atau in_progress) milik reviewer
        $activeAssignments = ReviewAssignment::with([
            'submission.journal.university',
            'assigner',
        ])
            ->forReviewer($reviewerId)
            ->whereIn('status', ['assigned', 'Accepted', 'in_progress'])
            ->orderBy('assigned_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,
                    'status_label' => $assignment->status_label ?? $assignment->status,
                    'status_color' => $assignment->status_color ?? 'gray',
                    'assigned_at' => $assignment->assigned_at,
                    'assigner' => $assignment->assigner ? [
                        'id' => $assignment->assigner->id,
                        'name' => $assignment->assigner->name,
                        'email' => $assignment->assigner->email,
                    ] : null,
                    'submission' => $assignment->submission ? [
                        'id' => $assignment->submission->id,
                        'title' => $assignment->submission->title,
                        'journal' => $assignment->submission->journal ? [
                            'id' => $assignment->submission->journal->id,
                            'title' => $assignment->submission->journal->title,
                            'issn' => $assignment->submission->journal->issn,
                            'e_issn' => $assignment->submission->journal->e_issn,
                            'sinta_rank' => $assignment->submission->journal->sinta_rank,
                            'university' => $assignment->submission->journal->university ? [
                                'id' => $assignment->submission->journal->university->id,
                                'name' => $assignment->submission->journal->university->name,
                                'short_name' => $assignment->submission->journal->university->short_name,
                            ] : null,
                        ] : null,
                    ] : null,
                ];
            });

        // Hitung ringkasan statistik untuk dashboard
        $stats = [
            'total_active' => $activeAssignments->count(),
            'total_assigned' => $activeAssignments->where('status', 'assigned')->count(),
            'total_in_progress' => $activeAssignments->whereIn('status', ['Accepted', 'in_progress'])->count(),
        ];

        return Inertia::render('Review/Dashboard', [
            'assignments' => $activeAssignments,
            'stats' => $stats,
        ]);
    }
}
