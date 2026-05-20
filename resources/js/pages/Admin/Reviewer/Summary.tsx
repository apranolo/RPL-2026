/**
 * ReviewSummary – Rekap Hasil Penilaian (Super Admin)
 *
 * @description
 * Halaman rekap komprehensif hasil penilaian jurnal untuk Super Admin.
 * Menampilkan tabel kalkulasi lengkap meliputi:
 * - Kartu statistik global (total, status, rata-rata skor, completion rate)
 * - Distribusi grade A–E dengan progress bar
 * - Tabel rekap per-program pembinaan
 * - Tabel rekap per-universitas
 * - Tabel kontribusi skor rata-rata per-kategori evaluasi
 * - Tabel detail penilaian dengan pagination
 * - Filter: pembinaan, universitas, status, periode, pencarian
 *
 * @route GET /admin/reviews/summary
 * @author FAHMI HIDAYAT
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    ClipboardList,
    FileSearch,
    Filter,
    GraduationCap,
    LayoutGrid,
    Search,
    TrendingUp,
    University,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

// ─── Breadcrumbs ────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rekap Hasil Penilaian', href: '/admin/reviews/summary' },
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

const GRADE_COLORS: Record<string, string> = {
    A: 'bg-emerald-500',
    B: 'bg-blue-500',
    C: 'bg-amber-500',
    D: 'bg-orange-500',
    E: 'bg-red-500',
};

const GRADE_TEXT_COLORS: Record<string, string> = {
    A: 'text-emerald-700 dark:text-emerald-400',
    B: 'text-blue-700 dark:text-blue-400',
    C: 'text-amber-700 dark:text-amber-400',
    D: 'text-orange-700 dark:text-orange-400',
    E: 'text-red-700 dark:text-red-400',
};

const GRADE_BG_COLORS: Record<string, string> = {
    A: 'bg-emerald-50 dark:bg-emerald-950/30',
    B: 'bg-blue-50 dark:bg-blue-950/30',
    C: 'bg-amber-50 dark:bg-amber-950/30',
    D: 'bg-orange-50 dark:bg-orange-950/30',
    E: 'bg-red-50 dark:bg-red-950/30',
};

function formatPct(value: number | null, decimals = 1): string {
    if (value === null || value === undefined) return '–';
    return `${value.toFixed(decimals)}%`;
}

function formatScore(value: number | null, decimals = 2): string {
    if (value === null || value === undefined) return '–';
    return value.toFixed(decimals);
}

function getGradeBadge(grade: string) {
    const letter = grade.charAt(0);
    const colorClass = GRADE_TEXT_COLORS[letter] ?? 'text-muted-foreground';
    return (
        <span className={`inline-flex items-center gap-1 font-semibold ${colorClass}`}>
            <Award className="h-3.5 w-3.5" />
            {grade}
        </span>
    );
}

function getStatusBadge(status: string, label: string) {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        draft: 'secondary',
        submitted: 'outline',
        reviewed: 'default',
    };
    return <Badge variant={variants[status] ?? 'outline'}>{label}</Badge>;
}

function getPctColor(pct: number | null): string {
    if (pct === null) return 'text-muted-foreground';
    if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    if (pct >= 80) return 'text-blue-600 dark:text-blue-400 font-semibold';
    if (pct >= 70) return 'text-amber-600 dark:text-amber-400 font-semibold';
    if (pct >= 60) return 'text-orange-600 dark:text-orange-400 font-semibold';
    return 'text-red-600 dark:text-red-400 font-semibold';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Stat card with icon, value, and sub-label */
function StatCard({
    icon: Icon,
    title,
    value,
    sub,
    highlight,
}: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    sub?: string;
    highlight?: boolean;
}) {
    return (
        <Card className={highlight ? 'border-primary/40 bg-primary/5' : undefined}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold tracking-tight ${highlight ? 'text-primary' : ''}`}>{value}</div>
                {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
        </Card>
    );
}

/** Grade distribution row */
function GradeRow({ item }: { item: GradeItem }) {
    const letter = item.grade.charAt(0);
    const barColor = GRADE_COLORS[letter] ?? 'bg-gray-400';
    const textColor = GRADE_TEXT_COLORS[letter] ?? 'text-muted-foreground';
    const bgColor = GRADE_BG_COLORS[letter] ?? '';

    return (
        <div className={`flex items-center gap-3 rounded-lg p-3 ${bgColor}`}>
            {/* Grade badge */}
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${barColor}`}
            >
                {letter}
            </div>

            {/* Label & bar */}
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${textColor}`}>{item.label}</span>
                    <span className="text-sm font-semibold tabular-nums">
                        {item.count} <span className="text-xs font-normal text-muted-foreground">jurnal</span>
                    </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                    />
                </div>
            </div>

            {/* Percentage */}
            <div className={`w-14 text-right text-sm font-semibold tabular-nums ${textColor}`}>
                {item.percentage.toFixed(1)}%
            </div>
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function ReviewSummary({
    globalStats,
    gradeDistribution,
    pembinaanSummary,
    universitySummary,
    categorySummary,
    assessments,
    filterOptions,
    filters,
}: Props) {
    // ── Filter state ──────────────────────────────────────────────────────────
    const [search, setSearch] = useState(filters.search ?? '');
    const [pembinaanId, setPembinaanId] = useState(filters.pembinaan_id ?? '');
    const [universityId, setUniversityId] = useState(filters.university_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [period, setPeriod] = useState(filters.period ?? '');

    const routeName = 'admin.reviews.summary';

    const applyFilters = (overrides: Partial<Record<string, string>>) => {
        const params: Record<string, string | undefined> = {
            search: search || undefined,
            pembinaan_id: pembinaanId || undefined,
            university_id: universityId || undefined,
            status: status || undefined,
            period: period || undefined,
            ...overrides,
        };
        // Remove undefined keys
        const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
        router.get(route(routeName), clean, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setPembinaanId('');
        setUniversityId('');
        setStatus('');
        setPeriod('');
        router.get(route(routeName), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = !!(search || pembinaanId || universityId || status || period);
    const submittedTotal = globalStats.submitted + globalStats.reviewed;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Hasil Penilaian" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">

                {/* ── Page Header ────────────────────────────────────────── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ClipboardList className="h-6 w-6 text-primary" />
                            Rekap Hasil Penilaian
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tabel kalkulasi komprehensif seluruh hasil penilaian jurnal
                        </p>
                    </div>
                </div>

                {/* ── Filter Panel ────────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filter &amp; Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="filter-search"
                                    placeholder="Cari judul / ISSN jurnal..."
                                    value={search}
                                    className="pl-9"
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search: search || undefined })}
                                />
                            </div>

                            {/* Pembinaan */}
                            <Select
                                value={pembinaanId || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setPembinaanId(val);
                                    applyFilters({ pembinaan_id: val || undefined });
                                }}
                            >
                                <SelectTrigger id="filter-pembinaan">
                                    <SelectValue placeholder="Semua Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Program</SelectItem>
                                    {filterOptions.pembinaan.map((p) => (
                                        <SelectItem key={p.value} value={String(p.value)}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* University */}
                            <Select
                                value={universityId || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setUniversityId(val);
                                    applyFilters({ university_id: val || undefined });
                                }}
                            >
                                <SelectTrigger id="filter-university">
                                    <SelectValue placeholder="Semua Universitas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Universitas</SelectItem>
                                    {filterOptions.universities.map((u) => (
                                        <SelectItem key={u.value} value={String(u.value)}>
                                            {u.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status */}
                            <Select
                                value={status || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setStatus(val);
                                    applyFilters({ status: val || undefined });
                                }}
                            >
                                <SelectTrigger id="filter-status">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {filterOptions.status_options.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Second row: Period + action buttons */}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {filterOptions.periods.length > 0 && (
                                <Select
                                    value={period || 'all'}
                                    onValueChange={(v) => {
                                        const val = v === 'all' ? '' : v;
                                        setPeriod(val);
                                        applyFilters({ period: val || undefined });
                                    }}
                                >
                                    <SelectTrigger id="filter-period" className="w-48">
                                        <SelectValue placeholder="Semua Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Periode</SelectItem>
                                        {filterOptions.periods.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => applyFilters({})}
                                className="gap-1.5"
                            >
                                <Search className="h-3.5 w-3.5" />
                                Terapkan
                            </Button>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Hapus Filter
                                </Button>
                            )}

                            {hasActiveFilters && (
                                <span className="text-xs text-muted-foreground">
                                    Filter aktif – data ditampilkan sesuai seleksi
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Global Stat Cards ───────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    <StatCard
                        icon={LayoutGrid}
                        title="Total Penilaian"
                        value={globalStats.total}
                        sub="Seluruh assessment"
                        highlight
                    />
                    <StatCard
                        icon={Activity}
                        title="Draft"
                        value={globalStats.draft}
                        sub="Belum disubmit"
                    />
                    <StatCard
                        icon={FileSearch}
                        title="Submitted"
                        value={globalStats.submitted}
                        sub="Menunggu review"
                    />
                    <StatCard
                        icon={GraduationCap}
                        title="Reviewed"
                        value={globalStats.reviewed}
                        sub="Sudah direview"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Rata-rata Skor"
                        value={formatPct(globalStats.avg_percentage)}
                        sub={
                            globalStats.avg_percentage !== null
                                ? `dari ${submittedTotal} penilaian`
                                : 'Belum ada data'
                        }
                    />
                    <StatCard
                        icon={BarChart3}
                        title="Completion Rate"
                        value={`${globalStats.completion_rate}%`}
                        sub="Submitted / total"
                    />
                </div>

                {/* ── Score Range Row ─────────────────────────────────────── */}
                {(globalStats.highest_score !== null || globalStats.lowest_score !== null) && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="border-emerald-200 dark:border-emerald-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Skor Tertinggi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatPct(globalStats.highest_score)}
                                </div>
                                <Progress
                                    value={globalStats.highest_score ?? 0}
                                    className="mt-2 h-1.5 [&>div]:bg-emerald-500"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Skor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getPctColor(globalStats.avg_percentage)}`}>
                                    {formatPct(globalStats.avg_percentage)}
                                </div>
                                <Progress value={globalStats.avg_percentage ?? 0} className="mt-2 h-1.5" />
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 dark:border-red-900">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Skor Terendah</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatPct(globalStats.lowest_score)}
                                </div>
                                <Progress
                                    value={globalStats.lowest_score ?? 0}
                                    className="mt-2 h-1.5 [&>div]:bg-red-500"
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── Tabs: Grade Dist | Per-Program | Per-Univ | Per-Kategori | Detail ── */}
                <Tabs defaultValue="grade" className="w-full">
                    <TabsList className="mb-4 flex-wrap gap-1 h-auto">
                        <TabsTrigger value="grade" className="gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Distribusi Grade
                        </TabsTrigger>
                        <TabsTrigger value="program" className="gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Per Program
                        </TabsTrigger>
                        <TabsTrigger value="university" className="gap-1.5">
                            <University className="h-3.5 w-3.5" />
                            Per Universitas
                        </TabsTrigger>
                        <TabsTrigger value="category" className="gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            Per Kategori
                        </TabsTrigger>
                        <TabsTrigger value="detail" className="gap-1.5">
                            <ClipboardList className="h-3.5 w-3.5" />
                            Detail Penilaian
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab: Distribusi Grade ─────────────────────────── */}
                    <TabsContent value="grade">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Distribusi Grade Penilaian
                                </CardTitle>
                                <CardDescription>
                                    Berdasarkan {submittedTotal} penilaian yang telah disubmit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {submittedTotal === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <Award className="mb-3 h-10 w-10 opacity-30" />
                                        <p className="text-sm">Belum ada penilaian yang disubmit</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {gradeDistribution.map((item) => (
                                            <GradeRow key={item.grade} item={item} />
                                        ))}

                                        <Separator className="my-4" />

                                        {/* Summary table */}
                                        <div className="overflow-x-auto rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Grade</TableHead>
                                                        <TableHead>Rentang Skor</TableHead>
                                                        <TableHead className="text-center">Jumlah</TableHead>
                                                        <TableHead className="text-right">Persentase</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {gradeDistribution.map((item) => {
                                                        const letter = item.grade.charAt(0);
                                                        return (
                                                            <TableRow key={item.grade}>
                                                                <TableCell>
                                                                    <span
                                                                        className={`font-bold ${GRADE_TEXT_COLORS[letter] ?? ''}`}
                                                                    >
                                                                        {item.grade}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground text-sm">
                                                                    {item.label}
                                                                </TableCell>
                                                                <TableCell className="text-center font-medium">
                                                                    {item.count}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span
                                                                        className={`tabular-nums font-semibold ${GRADE_TEXT_COLORS[letter] ?? ''}`}
                                                                    >
                                                                        {item.percentage.toFixed(1)}%
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    <TableRow className="bg-muted/30 font-semibold">
                                                        <TableCell colSpan={2}>Total</TableCell>
                                                        <TableCell className="text-center">
                                                            {submittedTotal}
                                                        </TableCell>
                                                        <TableCell className="text-right">100%</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: Per Program Pembinaan ──────────────────────── */}
                    <TabsContent value="program">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Rekap Per Program Pembinaan
                                </CardTitle>
                                <CardDescription>
                                    Jumlah penilaian dan rata-rata skor per program
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {pembinaanSummary.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <BookOpen className="mb-3 h-10 w-10 opacity-30" />
                                        <p className="text-sm">Tidak ada data program pembinaan</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[200px]">Program</TableHead>
                                                    <TableHead>Kategori</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Periode Penilaian</TableHead>
                                                    <TableHead className="text-center">Registrasi</TableHead>
                                                    <TableHead className="text-center">Draft</TableHead>
                                                    <TableHead className="text-center">Submitted</TableHead>
                                                    <TableHead className="text-center">Reviewed</TableHead>
                                                    <TableHead className="text-center">Total</TableHead>
                                                    <TableHead className="text-right">Rata-rata Skor</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pembinaanSummary.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-medium">{p.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {p.category_label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(p.status, p.status_label)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {p.assessment_period ?? '–'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="font-medium">{p.approved_registrations}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    / {p.total_registrations}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center text-muted-foreground">
                                                            {p.assessments.draft}
                                                        </TableCell>
                                                        <TableCell className="text-center text-amber-600 dark:text-amber-400">
                                                            {p.assessments.submitted}
                                                        </TableCell>
                                                        <TableCell className="text-center text-emerald-600 dark:text-emerald-400">
                                                            {p.assessments.reviewed}
                                                        </TableCell>
                                                        <TableCell className="text-center font-semibold">
                                                            {p.assessments.total}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span
                                                                className={`tabular-nums ${getPctColor(p.assessments.avg_percentage)}`}
                                                            >
                                                                {formatPct(p.assessments.avg_percentage)}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: Per Universitas ────────────────────────────── */}
                    <TabsContent value="university">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <University className="h-5 w-5 text-primary" />
                                    Rekap Per Universitas
                                </CardTitle>
                                <CardDescription>
                                    Distribusi penilaian dan performa rata-rata per institusi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {universitySummary.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <University className="mb-3 h-10 w-10 opacity-30" />
                                        <p className="text-sm">Tidak ada data universitas</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>No</TableHead>
                                                    <TableHead className="min-w-[200px]">Universitas</TableHead>
                                                    <TableHead>Kode</TableHead>
                                                    <TableHead className="text-center">Draft</TableHead>
                                                    <TableHead className="text-center">Submitted</TableHead>
                                                    <TableHead className="text-center">Reviewed</TableHead>
                                                    <TableHead className="text-center">Total</TableHead>
                                                    <TableHead className="text-right">Rata-rata Skor</TableHead>
                                                    <TableHead className="text-right">Completion</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {universitySummary.map((u, idx) => {
                                                    const completion = u.total > 0
                                                        ? ((u.submitted + u.reviewed) / u.total) * 100
                                                        : 0;
                                                    return (
                                                        <TableRow key={u.university_id}>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                {idx + 1}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {u.university_name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="font-mono text-xs">
                                                                    {u.university_code}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center text-muted-foreground">
                                                                {u.draft}
                                                            </TableCell>
                                                            <TableCell className="text-center text-amber-600 dark:text-amber-400">
                                                                {u.submitted}
                                                            </TableCell>
                                                            <TableCell className="text-center text-emerald-600 dark:text-emerald-400">
                                                                {u.reviewed}
                                                            </TableCell>
                                                            <TableCell className="text-center font-semibold">
                                                                {u.total}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span
                                                                    className={`tabular-nums ${getPctColor(u.avg_percentage)}`}
                                                                >
                                                                    {formatPct(u.avg_percentage)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Progress
                                                                        value={completion}
                                                                        className="h-1.5 w-16"
                                                                    />
                                                                    <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                                                                        {completion.toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: Per Kategori Evaluasi ──────────────────────── */}
                    <TabsContent value="category">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Kalkulasi Per Kategori Evaluasi
                                </CardTitle>
                                <CardDescription>
                                    Rata-rata kontribusi skor per kategori — berguna untuk identifikasi area lemah
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {categorySummary.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <Building2 className="mb-3 h-10 w-10 opacity-30" />
                                        <p className="text-sm">Tidak ada data kategori</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Kode</TableHead>
                                                    <TableHead className="min-w-[220px]">Kategori Evaluasi</TableHead>
                                                    <TableHead className="text-right">Bobot (%)</TableHead>
                                                    <TableHead className="text-right">Rata-rata Skor</TableHead>
                                                    <TableHead className="text-right">Rata-rata Maks</TableHead>
                                                    <TableHead className="text-right">Pencapaian</TableHead>
                                                    <TableHead className="text-center">Respon</TableHead>
                                                    <TableHead className="min-w-[140px]">Progress</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {categorySummary.map((cat) => (
                                                    <TableRow key={cat.category_id}>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {cat.category_code}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {cat.category_name}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                                            {cat.category_weight.toFixed(0)}%
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatScore(cat.avg_score)}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                                            {formatScore(cat.avg_max_score)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span
                                                                className={`tabular-nums font-semibold ${getPctColor(cat.avg_percentage)}`}
                                                            >
                                                                {formatPct(cat.avg_percentage)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-muted-foreground">
                                                            {cat.response_count.toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Progress
                                                                    value={cat.avg_percentage ?? 0}
                                                                    className="h-2 flex-1"
                                                                />
                                                                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                                                    {cat.avg_percentage !== null
                                                                        ? `${cat.avg_percentage.toFixed(0)}%`
                                                                        : '–'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: Detail Penilaian ───────────────────────────── */}
                    <TabsContent value="detail">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    Detail Seluruh Penilaian
                                </CardTitle>
                                <CardDescription>
                                    Daftar lengkap penilaian jurnal dengan skor dan grade individual
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {assessments.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <ClipboardList className="mb-3 h-10 w-10 opacity-30" />
                                        <p className="text-sm">Tidak ada penilaian ditemukan</p>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="mt-2 text-xs"
                                                onClick={clearFilters}
                                            >
                                                Hapus semua filter
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="min-w-[200px]">Jurnal</TableHead>
                                                        <TableHead className="min-w-[160px]">Universitas</TableHead>
                                                        <TableHead className="min-w-[140px]">Pengelola</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Periode</TableHead>
                                                        <TableHead className="text-right">Skor</TableHead>
                                                        <TableHead className="text-right">Maks</TableHead>
                                                        <TableHead className="text-right">Persen</TableHead>
                                                        <TableHead>Grade</TableHead>
                                                        <TableHead className="min-w-[120px]">Tanggal Submit</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {assessments.data.map((a) => (
                                                        <TableRow key={a.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium line-clamp-1">
                                                                        {a.journal?.title ?? '–'}
                                                                    </div>
                                                                    {a.journal?.issn && (
                                                                        <div className="font-mono text-xs text-muted-foreground">
                                                                            ISSN: {a.journal.issn}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {a.university ? (
                                                                    <div>
                                                                        <div className="font-medium line-clamp-1">
                                                                            {a.university.name}
                                                                        </div>
                                                                        <div className="font-mono text-xs text-muted-foreground">
                                                                            {a.university.code}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">–</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {a.user ? (
                                                                    <div>
                                                                        <div className="font-medium">{a.user.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {a.user.email}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">–</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusBadge(a.status, a.status_label)}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {a.period ?? '–'}
                                                            </TableCell>
                                                            <TableCell className="text-right tabular-nums">
                                                                {formatScore(a.total_score)}
                                                            </TableCell>
                                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                                {formatScore(a.max_score)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span
                                                                    className={`tabular-nums ${getPctColor(a.percentage ?? null)}`}
                                                                >
                                                                    {formatPct(a.percentage ?? null)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {a.percentage !== null
                                                                    ? getGradeBadge(a.grade)
                                                                    : <span className="text-muted-foreground text-sm">–</span>}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {a.submitted_at ?? '–'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Menampilkan{' '}
                                                <span className="font-medium">{assessments.from}</span>–
                                                <span className="font-medium">{assessments.to}</span> dari{' '}
                                                <span className="font-medium">{assessments.total}</span> penilaian
                                            </p>
                                            <div className="flex gap-2">
                                                {assessments.prev_page_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(assessments.prev_page_url!, {}, { preserveState: true })
                                                        }
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Sebelumnya
                                                    </Button>
                                                )}
                                                <span className="flex items-center px-2 text-sm text-muted-foreground">
                                                    Hal. {assessments.current_page} / {assessments.last_page}
                                                </span>
                                                {assessments.next_page_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(assessments.next_page_url!, {}, { preserveState: true })
                                                        }
                                                    >
                                                        Berikutnya
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
