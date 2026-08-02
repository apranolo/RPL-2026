/**
 * ReviewSummary – Rekap Hasil Penilaian & Keputusan Reviewer
 *
 * @description
 * Halaman analitik rekapitulasi penilaian akhir dan eksekusi keputusan LPPM.
 * Meringkas nilai rata-rata dari multi-reviewer, persentase kelulusan, serta menyediakan
 * fitur penetapan keputusan Diterima/Ditolak langsung oleh Admin Kampus / LPPM.
 *
 * @features
 * - Sesuai PRD Modul 2: Tabel analitik nilai rata-rata multi-reviewer & penetapan keputusan LPPM
 * - Integrasi Service: ReviewCalculationService (Rata-rata & statistik global)
 * - Integrasi Controller: DecisionController (POST /admin/decision/decide)
 * - Tabbed navigation: Rekap Proposal Riset (Modul 2) & Rekap Assessment Jurnal
 * - Desain responsif, accessible, dan kompatibel dengan Light/Dark Mode (UI/UX Pro Max)
 *
 * @route GET /admin/reviews/summary
 * @author FAHMI HIDAYAT
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Award,
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileSearch,
    FileText,
    Filter,
    GraduationCap,
    Layers,
    LayoutGrid,
    Search,
    UserCheck,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import React, { useState, type FormEvent } from 'react';

// ─── Breadcrumbs ────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rekap Penilaian & Keputusan', href: '/admin/reviews/summary' },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ReviewerDetail {
    id: number;
    reviewer_name: string;
    status: string;
    score: number | null;
    recommendation: string | null;
    notes: string | null;
}

interface ProposalSummaryItem {
    id: number;
    judul: string;
    status_proposal: string;
    rejection_reason?: string | null;
    author_name: string;
    university_name: string;
    schema_name: string;
    total_reviews: number;
    completed_reviews: number;
    avg_score: number | null;
    recommendations: Record<string, number>;
    reviewers: ReviewerDetail[];
}

interface ProposalSummaryData {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    avg_score: number | null;
    proposals: ProposalSummaryItem[];
}

interface GlobalStats {
    total: number;
    draft: number;
    submitted: number;
    reviewed: number;
    avg_score: number | null;
    avg_percentage: number | null;
    highest_score: number | null;
    lowest_score: number | null;
    completion_rate: number;
}

interface GradeItem {
    grade: string;
    label: string;
    count: number;
    percentage: number;
}

interface PembinaanSummaryItem {
    id: number;
    name: string;
    category: string;
    category_label: string;
    status: string;
    status_label: string;
    assessment_period: string | null;
    total_registrations: number;
    approved_registrations: number;
    assessments: {
        total: number;
        draft: number;
        submitted: number;
        reviewed: number;
        avg_percentage: number | null;
    };
}

interface UniversitySummaryItem {
    university_id: number;
    university_name: string;
    university_code: string;
    total: number;
    draft: number;
    submitted: number;
    reviewed: number;
    avg_percentage: number | null;
}

interface CategorySummaryItem {
    category_id: number;
    category_code: string;
    category_name: string;
    category_weight: number;
    avg_score: number | null;
    avg_max_score: number | null;
    avg_percentage: number | null;
    response_count: number;
}

interface AssessmentRow {
    id: number;
    period: string | null;
    status: string;
    status_label: string;
    status_color: string;
    total_score: number | null;
    max_score: number | null;
    percentage: number | null;
    grade: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    assessment_date: string | null;
    journal: { id: number; title: string; issn: string } | null;
    university: { id: number; name: string; code: string } | null;
    user: { id: number; name: string; email: string } | null;
}

interface FilterOption {
    value: number | string;
    label: string;
}

interface FilterOptions {
    pembinaan: FilterOption[];
    universities: FilterOption[];
    status_options: { value: string; label: string }[];
    periods: { value: string; label: string }[];
}

interface Filters {
    pembinaan_id?: string;
    university_id?: string;
    status?: string;
    period?: string;
    search?: string;
}

interface Props {
    proposalSummary?: ProposalSummaryData;
    globalStats: GlobalStats;
    gradeDistribution: GradeItem[];
    pembinaanSummary: PembinaanSummaryItem[];
    universitySummary: UniversitySummaryItem[];
    categorySummary: CategorySummaryItem[];
    assessments: PaginatedData<AssessmentRow>;
    filterOptions: FilterOptions;
    filters: Filters;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeToFixed(value: number | string | null | undefined, decimals = 1): string {
    if (value === null || value === undefined || value === '') return '–';
    const num = Number(value);
    if (isNaN(num)) return '–';
    return num.toFixed(decimals);
}

function formatPct(value: number | string | null | undefined, decimals = 1): string {
    if (value === null || value === undefined || value === '') return '–';
    const num = Number(value);
    if (isNaN(num)) return '–';
    return `${num.toFixed(decimals)}%`;
}

function formatScore(value: number | string | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || value === '') return '–';
    const num = Number(value);
    if (isNaN(num)) return '–';
    return num.toFixed(decimals);
}

function ProposalStatusBadge({ status }: { status: string }) {
    const s = (status ?? '').toLowerCase();
    if (s === 'diterima' || s === 'approved') {
        return (
            <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Diterima
            </Badge>
        );
    }
    if (s === 'ditolak' || s === 'rejected') {
        return (
            <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/10 font-medium text-destructive">
                <XCircle className="h-3 w-3 text-destructive" />
                Ditolak
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400">
            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            {status}
        </Badge>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewSummary({
    proposalSummary,
    globalStats,
    gradeDistribution,
    pembinaanSummary,
    universitySummary,
    categorySummary,
    assessments,
    filterOptions,
    filters,
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    // Filters
    const [search, setSearch] = useState(filters.search ?? '');
    const [universityId, setUniversityId] = useState(filters.university_id ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    // Decision Modal
    const [selectedProposal, setSelectedProposal] = useState<ProposalSummaryItem | null>(null);
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
    const [decisionValue, setDecisionValue] = useState<'approved' | 'rejected'>('approved');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.reviews.summary'),
            { search, university_id: universityId, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setUniversityId('');
        setStatusFilter('');
        router.get(route('admin.reviews.summary'));
    };

    const openDecisionModal = (proposal: ProposalSummaryItem) => {
        setSelectedProposal(proposal);
        setDecisionValue(proposal.status_proposal.toLowerCase() === 'ditolak' ? 'rejected' : 'approved');
        setRejectionReason(proposal.rejection_reason ?? '');
        setIsDecisionModalOpen(true);
    };

    const handleDecisionSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedProposal) return;

        setIsSubmitting(true);
        router.post(
            route('admin.decision.decide'),
            {
                type: 'proposal',
                id: selectedProposal.id,
                decision: decisionValue,
                reason: decisionValue === 'rejected' ? rejectionReason : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDecisionModalOpen(false);
                    setSelectedProposal(null);
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    // Prop statistics fallback
    const propTotal = proposalSummary?.total ?? 0;
    const propApproved = proposalSummary?.approved ?? 0;
    const propRejected = proposalSummary?.rejected ?? 0;
    const propAvgScore = proposalSummary?.avg_score ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Hasil Penilaian & Keputusan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Rekapitulasi Penilaian & Keputusan</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ringkasan nilai rata-rata dari multi-reviewer dan penentuan keputusan akhir LPPM untuk proposal penelitian.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 shadow-sm">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{propTotal} Total Proposal</span>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Proposal</p>
                                <p className="text-2xl font-bold text-foreground">{propTotal}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Diterima / Lolos</p>
                                <p className="text-2xl font-bold text-foreground">{propApproved}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ditolak / Revisi</p>
                                <p className="text-2xl font-bold text-foreground">{propRejected}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rata-rata Skor Review</p>
                                <p className="text-2xl font-bold text-foreground">{formatScore(propAvgScore)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="proposals" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted p-1">
                        <TabsTrigger value="proposals" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Rekap Proposal Riset (Modul 2)
                        </TabsTrigger>
                        <TabsTrigger value="journals" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Rekap Assessment Jurnal
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab 1: Proposal Research (Modul 2) ──────────────── */}
                    <TabsContent value="proposals" className="space-y-4">
                        {/* Filter Bar */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardContent className="p-4">
                                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <Input
                                            id="search-proposal"
                                            type="text"
                                            placeholder="Cari judul proposal..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                        />
                                    </div>

                                    {filterOptions.universities?.length > 0 && (
                                        <Select value={universityId} onValueChange={(val) => setUniversityId(val)}>
                                            <SelectTrigger className="w-[200px] border-border bg-background text-sm">
                                                <SelectValue placeholder="Semua Universitas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Semua Universitas</SelectItem>
                                                {filterOptions.universities.map((u) => (
                                                    <SelectItem key={u.value} value={String(u.value)}>
                                                        {u.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    <Button type="submit">Cari</Button>

                                    {(search || universityId) && (
                                        <Button type="button" variant="ghost" onClick={handleResetFilters}>
                                            <X className="mr-1.5 h-3.5 w-3.5" /> Reset
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        {/* Proposal Analytical Summary Table */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-foreground">Tabel Analitik Rekapitulasi Proposal</CardTitle>
                                <CardDescription>
                                    Meringkas nilai rata-rata dari multi-reviewer beserta tombol eksekusi keputusan akhir LPPM.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border hover:bg-transparent">
                                            <TableHead className="w-[30%]">Judul Proposal & Pengusul</TableHead>
                                            <TableHead>Skema</TableHead>
                                            <TableHead className="text-center">Reviewer Ditugaskan</TableHead>
                                            <TableHead className="text-center">Rata-rata Skor</TableHead>
                                            <TableHead className="text-center">Rekomendasi Reviewer</TableHead>
                                            <TableHead className="text-center">Status LPPM</TableHead>
                                            <TableHead className="text-right">Keputusan LPPM</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!proposalSummary || proposalSummary.proposals.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                                    <p className="text-sm font-medium">Belum ada proposal penelitian untuk direkap.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            proposalSummary.proposals.map((item) => (
                                                <TableRow key={item.id} className="border-border">
                                                    <TableCell>
                                                        <p className="line-clamp-2 font-medium text-foreground">{item.judul}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {item.author_name} • {item.university_name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-normal">
                                                            {item.schema_name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-xs font-semibold text-foreground">
                                                                {item.completed_reviews} / {item.total_reviews} Selesai
                                                            </span>
                                                            <div className="flex flex-wrap justify-center gap-1">
                                                                {item.reviewers.map((r) => (
                                                                    <Badge
                                                                        key={r.id}
                                                                        variant="secondary"
                                                                        className="text-[10px] py-0 px-1.5 font-normal"
                                                                        title={r.notes ?? 'Reviewer'}
                                                                    >
                                                                        {r.reviewer_name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.avg_score !== null ? (
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                {formatScore(item.avg_score)} / 100
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">— Belum Ada —</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center gap-1 text-xs">
                                                            {item.recommendations['Diterima'] > 0 && (
                                                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                                                                    {item.recommendations['Diterima']} Terima
                                                                </span>
                                                            )}
                                                            {item.recommendations['Revisi'] > 0 && (
                                                                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-400">
                                                                    {item.recommendations['Revisi']} Revisi
                                                                </span>
                                                            )}
                                                            {item.recommendations['Ditolak'] > 0 && (
                                                                <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-medium text-destructive">
                                                                    {item.recommendations['Ditolak']} Tolak
                                                                </span>
                                                            )}
                                                            {item.completed_reviews === 0 && (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ProposalStatusBadge status={item.status_proposal} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openDecisionModal(item)}
                                                            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                                        >
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                            Tetapkan Keputusan
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab 2: Journal Assessments ──────────────────────── */}
                    <TabsContent value="journals" className="space-y-6">
                        {/* Global Journal Stats */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase">Total Assessment</p>
                                    <p className="text-2xl font-bold">{globalStats.total}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase">Completion Rate</p>
                                    <p className="text-2xl font-bold">{formatPct(globalStats.completion_rate)}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase">Rata-rata Skor Jurnal</p>
                                    <p className="text-2xl font-bold">{formatScore(globalStats.avg_score)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grade Distribution & University Summary */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Grade Distribution Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribusi Grade (A - E)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {gradeDistribution.map((item) => (
                                        <div key={item.grade} className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{item.label}</span>
                                            <span className="font-bold">{item.count} Jurnal ({formatPct(item.percentage)})</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* University Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rekap Per-Universitas</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Universitas</TableHead>
                                                <TableHead className="text-center">Total</TableHead>
                                                <TableHead className="text-right">Rata-rata Skor</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {universitySummary.map((u) => (
                                                <TableRow key={u.university_id}>
                                                    <TableCell className="font-medium">{u.university_name}</TableCell>
                                                    <TableCell className="text-center">{u.total}</TableCell>
                                                    <TableCell className="text-right">{formatPct(u.avg_percentage)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Decision Modal Dialog */}
            <Dialog open={isDecisionModalOpen} onOpenChange={setIsDecisionModalOpen}>
                <DialogContent className="max-w-md rounded-xl border-border bg-card p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            Penetapan Keputusan LPPM
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {selectedProposal?.judul}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProposal && (
                        <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-2">
                            {/* Summary of Reviewers */}
                            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pengusul:</span>
                                    <span className="font-medium text-foreground">{selectedProposal.author_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rata-rata Skor Reviewer:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatScore(selectedProposal.avg_score)} / 100
                                    </span>
                                </div>
                            </div>

                            {/* Decision Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="decision-select" className="text-sm font-medium text-foreground">
                                    Keputusan Akhir <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={decisionValue}
                                    onValueChange={(val: 'approved' | 'rejected') => setDecisionValue(val)}
                                >
                                    <SelectTrigger id="decision-select" className="border-border bg-background">
                                        <SelectValue placeholder="Pilih keputusan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approved">Diterima (Setuju Lolos Seleksi)</SelectItem>
                                        <SelectItem value="rejected">Ditolak (Tidak Lolos)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Rejection Reason (Required if rejected) */}
                            {decisionValue === 'rejected' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="rejection-reason" className="text-sm font-medium text-foreground">
                                        Alasan Penolakan <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="rejection-reason"
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Tuliskan alasan penolakan minimal 10 karakter..."
                                        required
                                        minLength={10}
                                        className="resize-none border-border bg-background text-sm"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsDecisionModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
                                    Simpan Keputusan
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
