<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewerAssignment;
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
     * Mengambil semua assignment dengan status 'assigned' atau 'in_progress'
     * beserta relasi registration, journal, pembinaan, dan assigner
     * yang dimiliki oleh reviewer yang sedang terautentikasi.
     */
    public function index()
    {
        $reviewerId = Auth::id();

        // Ambil semua tugas review aktif (assigned atau in_progress) milik reviewer
        $activeAssignments = ReviewerAssignment::with([
            'registration.journal.university',
            'registration.pembinaan',
            'assigner',
        ])
            ->forReviewer($reviewerId)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->orderBy('assigned_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id'          => $assignment->id,
                    'status'      => $assignment->status,
                    'status_label' => $assignment->status_label,
                    'status_color' => $assignment->status_color,
                    'assigned_at' => $assignment->assigned_at,
                    'assigner'    => $assignment->assigner ? [
                        'id'    => $assignment->assigner->id,
                        'name'  => $assignment->assigner->name,
                        'email' => $assignment->assigner->email,
                    ] : null,
                    'registration' => $assignment->registration ? [
                        'id'     => $assignment->registration->id,
                        'status' => $assignment->registration->status,
                        'registered_at' => $assignment->registration->registered_at,
                        'journal' => $assignment->registration->journal ? [
                            'id'         => $assignment->registration->journal->id,
                            'title'      => $assignment->registration->journal->title,
                            'issn'       => $assignment->registration->journal->issn,
                            'e_issn'     => $assignment->registration->journal->e_issn,
                            'sinta_rank' => $assignment->registration->journal->sinta_rank,
                            'university' => $assignment->registration->journal->university ? [
                                'id'         => $assignment->registration->journal->university->id,
                                'name'       => $assignment->registration->journal->university->name,
                                'short_name' => $assignment->registration->journal->university->short_name,
                            ] : null,
                        ] : null,
                        'pembinaan' => $assignment->registration->pembinaan ? [
                            'id'               => $assignment->registration->pembinaan->id,
                            'name'             => $assignment->registration->pembinaan->name,
                            'assessment_start' => $assignment->registration->pembinaan->assessment_start,
                            'assessment_end'   => $assignment->registration->pembinaan->assessment_end,
                        ] : null,
                    ] : null,
                ];
            });

        // Hitung ringkasan statistik untuk dashboard
        $stats = [
            'total_active'      => $activeAssignments->count(),
            'total_assigned'    => $activeAssignments->where('status', 'assigned')->count(),
            'total_in_progress' => $activeAssignments->where('status', 'in_progress')->count(),
        ];

        return Inertia::render('Review/Dashboard', [
            'assignments' => $activeAssignments,
            'stats'       => $stats,
        ]);
    }
}
