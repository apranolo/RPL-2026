/**
 * Review/Summary Page
 *
 * Halaman rekapitulasi review multi-reviewer untuk sebuah Proposal.
 * Menampilkan:
 * - Info proposal (judul, deskripsi)
 * - Statistik ringkasan (rata-rata skor, jumlah reviewer selesai, dll)
 * - Tabel matriks review per reviewer (ReviewMatrixTable)
 *
 * MOCK LOKAL - hapus setelah model resmi ReviewDecision & ReviewerAssignment di-merge.
 *
 * @route GET /proposals/{proposal}/summary (review.summary.index)
 */

import { ReviewMatrixTable } from '@/components/ReviewMatrixTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart2, CheckCircle, ClipboardList, FileText, Users } from 'lucide-react';

interface ReviewerAssignmentRow {
    id: number;
    reviewer_name: string | null;
    due_date: string | null;
    status: 'assigned' | 'in_progress' | 'completed' | string;
    score: number | null;
    recommendation: string | null;
    comment: string | null;
}

interface ProposalData {
    id: number;
    judul: string;
    deskripsi: string | null;
}

interface Props {
    proposal: ProposalData;
    assignments: ReviewerAssignmentRow[];
}

export default function ReviewSummary({ proposal, assignments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proposal', href: route('proposal.index') },
        { title: proposal.judul, href: '#' },
        { title: 'Rekap Review', href: '#' },
    ];

    // --- Statistik ringkasan ---
    const completedAssignments = assignments.filter((a) => a.status === 'completed');
    const scoredAssignments = completedAssignments.filter((a) => a.score !== null);
    const averageScore =
        scoredAssignments.length > 0
            ? Math.round(scoredAssignments.reduce((sum, a) => sum + (a.score ?? 0), 0) / scoredAssignments.length)
            : null;

    const recommendationCounts = assignments.reduce<Record<string, number>>((acc, a) => {
        if (a.recommendation) {
            acc[a.recommendation] = (acc[a.recommendation] ?? 0) + 1;
        }
        return acc;
    }, {});

    const dominantRecommendation = Object.entries(recommendationCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    const recommendationLabels: Record<string, string> = {
        accepted: 'Diterima',
        revision: 'Revisi',
        rejected: 'Ditolak',
    };

    const scoreColor = averageScore === null ? 'text-muted-foreground' : averageScore >= 80 ? 'text-green-600' : averageScore >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap Review - ${proposal.judul}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

                {/* Header Proposal */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold leading-tight">{proposal.judul}</h1>
                                <Badge variant="outline" className="text-xs">
                                    ID #{proposal.id}
                                </Badge>
                            </div>
                            {proposal.deskripsi && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{proposal.deskripsi}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kartu Statistik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviewer</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{assignments.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">reviewer ditugaskan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Selesai Review</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{completedAssignments.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">dari {assignments.length} reviewer</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Skor</CardTitle>
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${scoreColor}`}>
                                {averageScore !== null ? averageScore : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {scoredAssignments.length > 0 ? `dari ${scoredAssignments.length} reviewer yang menilai` : 'belum ada penilaian'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rekomendasi Mayoritas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dominantRecommendation
                                    ? recommendationLabels[dominantRecommendation] ?? dominantRecommendation
                                    : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {dominantRecommendation
                                    ? `${recommendationCounts[dominantRecommendation]} dari ${completedAssignments.length} reviewer`
                                    : 'belum ada rekomendasi'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Matriks Review */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Matriks Review Per Reviewer</h2>
                        <span className="text-sm text-muted-foreground">{assignments.length} penugasan</span>
                    </div>
                    <ReviewMatrixTable assignments={assignments} />
                </div>
            </div>
        </AppLayout>
    );
}
