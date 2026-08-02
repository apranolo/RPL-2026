/**
 * Reviewer/index — Dashboard Tugas Penilaian Reviewer
 *
 * @description
 * Halaman daftar tugas penilaian proposal penelitian untuk peran Reviewer.
 * Menampilkan ringkasan statistik tugas, filter pencarian & status, tabel penugasan,
 * serta modal form evaluasi penilaian berstandar UI/UX Pro Max.
 *
 * @features
 * - Header halaman & Breadcrumbs navigasi terintegrasi AppLayout
 * - Stat Cards ringkasan: Total Tugas, Menunggu/Dalam Proses, Selesai
 * - Fitur Filter & Pencarian berdasarkan status
 * - Tabel penugasan dengan indikator Badge status semantik
 * - Modal Form Penilaian lengkap dengan input skor, rekomendasi, umpan balik, dan aksi simpan
 * - Kompatibel dengan tema terang dan gelap (Light/Dark Mode)
 *
 * @route GET /reviewer/assignments
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Award,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock,
    FileText,
    Filter,
    Layers,
    Search,
    UserCheck,
    X,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState, type FormEvent } from 'react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AssessmentCriteria {
    id: number;
    criterion: string;
    score: number;
    notes?: string | null;
}

interface Proposal {
    id: number;
    title?: string;
    judul?: string;
    description?: string;
    deskripsi?: string;
    file_dokumen_proposal?: string | null;
    proposal_doc_path?: string | null;
}

interface Review {
    id: number;
    proposal_id?: number;
    proposal?: Proposal | null;
    status: string;
    assessment_criteria?: AssessmentCriteria[];
    created_at: string;
    score?: number | null;
    total_score?: number | null;
    notes?: string | null;
    feedback?: string | null;
    recommendation?: string | null;
}

interface TasksPagination {
    data: Review[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tasks?: TasksPagination;
    assignments?: TasksPagination;
    progressReports?: TasksPagination;
    selectedReview?: Review | null;
    filters?: {
        status?: string;
        search?: string;
    };
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tugas Reviewer', href: '/reviewer/assignments' },
];

// ─── Status Badge Helper ──────────────────────────────────────────────────────

function ReviewStatusBadge({ status }: { status: string }) {
    const normStatus = (status ?? '').toLowerCase();
    if (normStatus === 'completed' || normStatus === 'selesai') {
        return (
            <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Selesai
            </Badge>
        );
    }
    if (normStatus === 'in_progress' || normStatus === 'dalam proses') {
        return (
            <Badge variant="outline" className="gap-1 border-blue-500/40 bg-blue-500/10 font-normal text-blue-700 dark:text-blue-400">
                <Clock className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                Dalam Proses
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 font-normal text-amber-700 dark:text-amber-400">
            <Clock className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
            Belum Dinilai
        </Badge>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewerIndex({ tasks, assignments, progressReports, selectedReview, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const taskData = tasks ?? assignments ?? progressReports;

    const [activeReview, setActiveReview] = useState<Review | null>(selectedReview ?? null);
    const [isDialogOpen, setIsDialogOpen] = useState(Boolean(selectedReview));
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    // Form states
    const [scoreInput, setScoreInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [recommendationInput, setRecommendationInput] = useState('');
    const [statusInput, setStatusInput] = useState('completed');
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const getProposalTitle = (proposal?: Proposal | null) => proposal?.title ?? proposal?.judul ?? 'Proposal Tanpa Judul';
    const getProposalDescription = (proposal?: Proposal | null) =>
        proposal?.description ?? proposal?.deskripsi ?? 'Belum ada deskripsi proposal.';
    const getProposalDoc = (proposal?: Proposal | null) =>
        proposal?.file_dokumen_proposal ?? proposal?.proposal_doc_path ?? null;

    useEffect(() => {
        if (flash?.success) setFlashMessage({ type: 'success', text: flash.success });
        else if (flash?.error) setFlashMessage({ type: 'error', text: flash.error });
        else setFlashMessage(null);
        const timer = setTimeout(() => setFlashMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [flash]);

    useEffect(() => {
        if (selectedReview) {
            setActiveReview(selectedReview);
            setIsDialogOpen(true);
            const scoreVal = selectedReview.total_score ?? selectedReview.score;
            setScoreInput(scoreVal?.toString() ?? '');
            setFeedbackInput(selectedReview.notes ?? selectedReview.feedback ?? '');
            setRecommendationInput(selectedReview.recommendation ?? '');
            setStatusInput(selectedReview.status ?? 'completed');
        }
    }, [selectedReview]);

    const openReviewDetails = (review: Review) => {
        setActiveReview(review);
        setIsDialogOpen(true);
        const scoreVal = review.total_score ?? review.score;
        setScoreInput(scoreVal?.toString() ?? '');
        setFeedbackInput(review.notes ?? review.feedback ?? '');
        setRecommendationInput(review.recommendation ?? '');
        setStatusInput(review.status ?? 'completed');
    };

    const closeReviewDetails = () => {
        setIsDialogOpen(false);
        setActiveReview(null);
    };

    const handleFilterChange = (val: string) => {
        setStatusFilter(val);
        router.get(
            route('reviewer.assignments.index'),
            { status: val, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('reviewer.assignments.index'),
            { status: statusFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setStatusFilter('');
        setSearchQuery('');
        router.get(route('reviewer.assignments.index'));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!activeReview) return;

        router.post(
            route('reviewer.assignments.submit-review', activeReview.id),
            {
                total_score: scoreInput,
                score: scoreInput,
                feedback: feedbackInput,
                notes: feedbackInput,
                recommendation: recommendationInput,
                status: statusInput,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setActiveReview(null);
                },
            }
        );
    };

    // Calculate Summary Counters
    const totalCount = taskData?.total ?? taskData?.data?.length ?? 0;
    const completedCount = taskData?.data?.filter((r) => (r.status ?? '').toLowerCase() === 'completed' || (r.status ?? '').toLowerCase() === 'selesai').length ?? 0;
    const pendingCount = Math.max(0, totalCount - completedCount);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tugas Penilaian — Reviewer" />

            {/* Flash Message Toast */}
            {flashMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl ${
                        flashMessage.type === 'success'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }`}
                >
                    {flashMessage.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {flashMessage.text}
                </div>
            )}

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tugas Penilaian Proposal</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola evaluasi dan berikan nilai ulasan untuk proposal penelitian yang ditugaskan kepada Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{totalCount} Penugasan</span>
                    </div>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Penugasan</p>
                                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Perlu Evaluasi</p>
                                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selesai Dinilai</p>
                                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filter Controls */}
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <Input
                                    id="search-tasks"
                                    type="text"
                                    placeholder="Cari judul proposal..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger id="filter-status" className="w-[180px] border-border bg-background text-sm">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Status</SelectItem>
                                    <SelectItem value="pending">Belum Dinilai</SelectItem>
                                    <SelectItem value="in_progress">Dalam Proses</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button type="submit" id="btn-search-tasks">
                                Cari
                            </Button>

                            {(statusFilter || searchQuery) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleResetFilters}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Assignments Table Card */}
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="w-[38%] text-muted-foreground">Judul Proposal</TableHead>
                                    <TableHead className="text-muted-foreground">Status Review</TableHead>
                                    <TableHead className="text-muted-foreground">Rubrik Kriteria</TableHead>
                                    <TableHead className="text-muted-foreground">Skor Evaluasi</TableHead>
                                    <TableHead className="text-muted-foreground">Tanggal Penugasan</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!taskData || taskData.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                            <p className="text-sm font-medium">Belum ada tugas review yang ditugaskan.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    taskData.data.map((task) => {
                                        const scoreVal = task.total_score ?? task.score;
                                        return (
                                            <TableRow key={task.id} className="border-border">
                                                <TableCell>
                                                    <p className="line-clamp-2 font-medium text-foreground">
                                                        {getProposalTitle(task.proposal)}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <ReviewStatusBadge status={task.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal text-muted-foreground">
                                                        {task.assessment_criteria?.length ?? 0} Indikator
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {scoreVal !== null && scoreVal !== undefined ? (
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {scoreVal} / 100
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(task.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openReviewDetails(task)}
                                                        className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                                    >
                                                        <ClipboardCheck className="h-3.5 w-3.5" />
                                                        {scoreVal !== null ? 'Lihat / Edit' : 'Buka Penilaian'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination Controls */}
                {taskData && taskData.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {(taskData.current_page - 1) * taskData.per_page + 1}–
                            {Math.min(taskData.current_page * taskData.per_page, taskData.total)} dari {taskData.total} tugas
                        </p>
                        <div className="flex items-center gap-1">
                            {taskData.links.map((link, idx) => {
                                const isFirst = idx === 0;
                                const isLast = idx === taskData.links.length - 1;
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground font-medium'
                                                : 'border border-border bg-background text-foreground hover:bg-muted'
                                        } disabled:pointer-events-none disabled:opacity-40`}
                                    >
                                        {isFirst ? (
                                            <ChevronLeft className="h-4 w-4" />
                                        ) : isLast ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Evaluation Form Modal Dialog */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) closeReviewDetails();
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-border bg-card p-6 shadow-xl">
                    <DialogHeader className="pb-2 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ClipboardCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    {getProposalTitle(activeReview?.proposal)}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Formulir Evaluasi & Penilaian Proposal Penelitian
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {activeReview && (
                        <div className="space-y-6 pt-2">
                            {/* Proposal Overview & Document Box */}
                            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Deskripsi Proposal
                                    </h4>
                                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                                        {getProposalDescription(activeReview.proposal)}
                                    </p>
                                </div>

                                {getProposalDoc(activeReview.proposal) && (
                                    <div className="flex items-center justify-between rounded-md border border-border bg-background p-2.5">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-xs truncate max-w-[320px]">
                                                {getProposalDoc(activeReview.proposal)}
                                            </span>
                                        </div>
                                        <a
                                            href={`/storage/${getProposalDoc(activeReview.proposal)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                                                Lihat Dokumen
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Evaluation Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Score Input */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="score" className="text-sm font-medium text-foreground">
                                            Skor Evaluasi (0 - 100) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={scoreInput}
                                            onChange={(e) => setScoreInput(e.target.value)}
                                            placeholder="Masukkan nilai (contoh: 85)"
                                            required
                                            className="border-border bg-background"
                                        />
                                    </div>

                                    {/* Status Input */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="status" className="text-sm font-medium text-foreground">
                                            Status Penilaian <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={statusInput} onValueChange={setStatusInput}>
                                            <SelectTrigger id="status" className="border-border bg-background">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_progress">Dalam Proses</SelectItem>
                                                <SelectItem value="completed">Selesai (Completed)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Recommendation Dropdown */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="recommendation" className="text-sm font-medium text-foreground">
                                        Rekomendasi Keputusan Reviewer
                                    </Label>
                                    <Select value={recommendationInput} onValueChange={setRecommendationInput}>
                                        <SelectTrigger id="recommendation" className="border-border bg-background">
                                            <SelectValue placeholder="Pilih rekomendasi..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Diterima">Diterima</SelectItem>
                                            <SelectItem value="Revisi">Revisi</SelectItem>
                                            <SelectItem value="Ditolak">Ditolak</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Feedback / Notes */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
                                        Umpan Balik & Catatan Evaluasi <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        rows={4}
                                        value={feedbackInput}
                                        onChange={(e) => setFeedbackInput(e.target.value)}
                                        placeholder="Tuliskan catatan evaluasi, kelebihan, dan aspek perbaikan proposal..."
                                        required
                                        className="resize-none border-border bg-background text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">{feedbackInput.length}/2000 karakter</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                    <Button type="button" variant="outline" onClick={closeReviewDetails}>
                                        Batal
                                    </Button>
                                    <Button type="submit" className="gap-1.5 bg-primary text-primary-foreground">
                                        <ClipboardCheck className="h-4 w-4" />
                                        Simpan Penilaian
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
