/**
 * JournalSummary – Rekapitulasi Assessment Jurnal (JurnalMu)
 *
 * @description
 * Halaman khusus rekapitulasi penilaian assessment jurnal untuk Super Admin dan Admin Kampus.
 * Menampilkan tabel kalkulasi lengkap meliputi:
 * - Kartu statistik global (total, status, rata-rata skor, completion rate)
 * - Distribusi grade A–E dengan progress bar
 * - Tabel rekap per-program pembinaan & per-universitas
 * - Tabel kontribusi skor rata-rata per-kategori evaluasi
 * - Tabel detail penilaian dengan pagination & filter
 *
 * @route GET /admin/assessments/summary
 * @author FAHMI HIDAYAT
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Award,
    BarChart3,
    BookOpen,
    Building2,
    ChevronLeft,
    ChevronRight,
    FileSearch,
    GraduationCap,
    Search,
    TrendingUp,
    University,
    X,
} from 'lucide-react';
import React, { useState, type FormEvent } from 'react';

// ─── Breadcrumbs ────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rekap Assessment Jurnal', href: '/admin/assessments/summary' },
];

// ─── Type Definitions ────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JournalSummary({
    globalStats,
    gradeDistribution,
    pembinaanSummary,
    universitySummary,
    categorySummary,
    assessments,
    filterOptions,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [universityId, setUniversityId] = useState(filters.university_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.assessments.summary'),
            { search, university_id: universityId, status },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setUniversityId('');
        setStatus('');
        router.get(route('admin.assessments.summary'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Assessment Jurnal" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Rekapitulasi Assessment Jurnal</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Monitoring dan analitik komprehensif evaluasi penilaian jurnal secara keseluruhan.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 shadow-sm">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{globalStats.total} Assessment</span>
                    </div>
                </div>

                {/* Global Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Assessment</p>
                                <p className="text-2xl font-bold text-foreground">{globalStats.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold text-foreground">{formatPct(globalStats.completion_rate)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rata-rata Skor</p>
                                <p className="text-2xl font-bold text-foreground">{formatScore(globalStats.avg_score)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Assessment Selesai</p>
                                <p className="text-2xl font-bold text-foreground">{globalStats.reviewed + globalStats.submitted}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Controls */}
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <Input
                                    id="search-journal"
                                    type="text"
                                    placeholder="Cari judul jurnal atau ISSN..."
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

                            {(search || universityId || status) && (
                                <Button type="button" variant="ghost" onClick={handleResetFilters}>
                                    <X className="mr-1.5 h-3.5 w-3.5" /> Reset
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Grade Distribution & University Summary Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Grade Distribution */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Distribusi Grade Penilaian (A - E)
                            </CardTitle>
                            <CardDescription>Persentase dan jumlah jurnal per kategori grade</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {gradeDistribution.map((item) => (
                                <div key={item.grade} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-foreground">{item.label}</span>
                                        <span className="font-semibold tabular-nums text-muted-foreground">
                                            {item.count} Jurnal ({formatPct(item.percentage)})
                                        </span>
                                    </div>
                                    <Progress value={Number(item.percentage ?? 0)} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* University Summary */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Building2 className="h-5 w-5 text-primary" />
                                Rekap Per-Universitas
                            </CardTitle>
                            <CardDescription>Performa penilaian jurnal per institusi</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead>Universitas</TableHead>
                                        <TableHead className="text-center">Total</TableHead>
                                        <TableHead className="text-right">Rata-rata Skor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {universitySummary.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                                Belum ada data per universitas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        universitySummary.map((u) => (
                                            <TableRow key={u.university_id} className="border-border">
                                                <TableCell className="font-medium text-foreground">
                                                    {u.university_name}
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground">{u.total}</TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {formatPct(u.avg_percentage)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Paginated Assessment Table */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-foreground">Daftar Detail Assessment Jurnal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="w-[35%]">Jurnal</TableHead>
                                    <TableHead>Universitas</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                    <TableHead className="text-right">Skor Total</TableHead>
                                    <TableHead className="text-right">Persentase</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assessments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            Belum ada assessment jurnal untuk ditampilkan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assessments.data.map((row) => (
                                        <TableRow key={row.id} className="border-border">
                                            <TableCell>
                                                <p className="font-medium text-foreground">{row.journal?.title ?? 'Jurnal'}</p>
                                                <p className="text-xs text-muted-foreground">ISSN: {row.journal?.issn ?? '—'}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {row.university?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="font-normal capitalize">
                                                    {row.status_label ?? row.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="font-bold">
                                                    {row.grade ?? '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatScore(row.total_score)} / {formatScore(row.max_score)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatPct(row.percentage)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {assessments && assessments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {(assessments.current_page - 1) * assessments.per_page + 1}–
                            {Math.min(assessments.current_page * assessments.per_page, assessments.total)} dari {assessments.total} assessment
                        </p>
                        <div className="flex items-center gap-1">
                            {assessments.links.map((link, idx) => (
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
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
