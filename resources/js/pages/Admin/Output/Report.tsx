/**
 * OutputReport Component
 *
 * @description
 * Printable recap (rekap) of luaran (outputs) — approved pembinaan registrations.
 * Displays a numbered list of journals grouped with their programme info,
 * plus summary cards for totals per category and per year.
 *
 * On-screen: filter toolbar (category + year) + Print button are visible.
 * On print:  only the document header, summary, and table are printed.
 *
 * @route GET /admin/output/report
 *
 * @props
 * - registrations  : flat list of approved PembinaanRegistration with relations
 * - statsByCategory: [{category, label, total}] — from OutputStatsCtrl::getCategory
 * - statsByYear    : [{year, total}]             — from OutputStatsCtrl::getYearly
 * - filters        : {category?, year?}
 * - generatedAt    : ISO timestamp string
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Calendar, FileDown, Filter, LayoutList, Printer, X } from 'lucide-react';

/* ─────────────────────────────────────────────
   Local types
───────────────────────────────────────────── */
interface University {
    id: number;
    name: string;
    short_name?: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
    sinta_rank?: string;
    sinta_rank_label?: string;
    university: University;
}

interface PembinaanInfo {
    id: number;
    name: string;
    category: 'akreditasi' | 'indeksasi';
}

interface Registration {
    id: number;
    journal: Journal;
    pembinaan: PembinaanInfo;
    registered_at: string; // ISO
    status: 'approved';
}

interface CategoryStat {
    category: string;
    label: string;
    total: number;
}

interface YearlyStat {
    year: number;
    total: number;
}

interface Filters {
    category?: string;
    year?: string;
}

interface Props {
    registrations: Registration[];
    statsByCategory: CategoryStat[];
    statsByYear: YearlyStat[];
    filters: Filters;
    generatedAt: string;
}

/* ─────────────────────────────────────────────
   Breadcrumbs
───────────────────────────────────────────── */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Output', href: '#' },
    { title: 'Rekap Luaran', href: '/admin/output/report' },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
    akreditasi: 'Akreditasi',
    indeksasi: 'Indeksasi',
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateShort(iso: string): string {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function categoryBadgeVariant(category: string): 'default' | 'secondary' | 'outline' {
    if (category === 'akreditasi') return 'default';
    if (category === 'indeksasi') return 'secondary';
    return 'outline';
}

/* ─────────────────────────────────────────────
   Year list helper — unique years from data
───────────────────────────────────────────── */
function uniqueYears(registrations: Registration[]): number[] {
    const set = new Set(registrations.map((r) => new Date(r.registered_at).getFullYear()));
    return Array.from(set).sort((a, b) => a - b);
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function OutputReport({ registrations, statsByCategory, statsByYear, filters, generatedAt }: Props) {
    const grandTotal = statsByCategory.reduce((s, c) => s + c.total, 0);

    /* Filter handlers */
    const applyFilter = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        // Remove empty keys
        Object.keys(next).forEach((k) => {
            if (!next[k as keyof Filters]) delete next[k as keyof Filters];
        });
        router.get(route('admin.output.report'), next, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        router.get(route('admin.output.report'));
    };

    const hasActiveFilters = Boolean(filters.category || filters.year);

    /* Available years from statsByYear + local data */
    const yearOptions = statsByYear.length > 0 ? statsByYear.map((s) => s.year) : uniqueYears(registrations);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Luaran" />

            {/*
             * ── Print styles (scoped via <style> injected into <head>)
             * On screen: .print-only is hidden, .no-print is visible.
             * On print:  .no-print is hidden, .print-only is visible.
             */}
            <style>{`
                @media print {
                    .no-print   { display: none !important; }
                    .print-only { display: block !important; }
                    body        { font-size: 11pt; color: #000; }
                    @page       { margin: 1.5cm; size: A4 portrait; }
                    table       { border-collapse: collapse; width: 100%; }
                    th, td      { border: 1px solid #999; padding: 4pt 6pt; font-size: 10pt; }
                    th          { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
                    tr:nth-child(even) td { background: #fafafa !important; -webkit-print-color-adjust: exact; }
                }
                .print-only { display: none; }
            `}</style>

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">

                    {/* ── On-screen page header ── */}
                    <div className="no-print mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Rekap Luaran</h1>
                                <p className="mt-1 text-muted-foreground">
                                    Daftar luaran program pembinaan jurnal (status: disetujui)
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    id="btn-export-excel"
                                    variant="outline"
                                    onClick={() => {
                                        const url = new URL(route('admin.output.export'), window.location.origin);
                                        if (filters.category) url.searchParams.set('category', filters.category);
                                        if (filters.year) url.searchParams.set('year', filters.year);
                                        window.location.href = url.toString();
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export Excel
                                </Button>

                                <Button
                                    id="btn-print-report"
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Cetak Laporan
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Print document header (hidden on screen) ── */}
                    <div className="print-only mb-6 text-center">
                        <h1 className="text-xl font-bold uppercase tracking-widest">
                            Rekap Luaran Program Pembinaan Jurnal
                        </h1>
                        {(filters.category || filters.year) && (
                            <p className="mt-1 text-sm">
                                {filters.category ? `Kategori: ${CATEGORY_LABELS[filters.category] ?? filters.category}` : ''}
                                {filters.category && filters.year ? ' · ' : ''}
                                {filters.year ? `Tahun: ${filters.year}` : ''}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Dicetak pada: {formatDate(generatedAt)}
                        </p>
                        <hr className="mt-3 border-gray-400" />
                    </div>

                    {/* ── Filter toolbar (hidden on print) ── */}
                    <div className="no-print mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                Filter
                            </div>

                            {/* Category filter */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Kategori</span>
                                <Select
                                    value={filters.category || 'all'}
                                    onValueChange={(v) => applyFilter({ category: v === 'all' ? '' : v })}
                                >
                                    <SelectTrigger id="filter-category" className="w-44">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        <SelectItem value="akreditasi">Akreditasi</SelectItem>
                                        <SelectItem value="indeksasi">Indeksasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year filter */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Tahun</span>
                                <Select
                                    value={filters.year || 'all'}
                                    onValueChange={(v) => applyFilter({ year: v === 'all' ? '' : v })}
                                >
                                    <SelectTrigger id="filter-year" className="w-36">
                                        <SelectValue placeholder="Semua Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tahun</SelectItem>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={String(y)}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    id="btn-clear-filters"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 self-end"
                                >
                                    <X className="h-3 w-3" />
                                    Hapus Filter
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ── Summary cards ── */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Grand total */}
                        <Card className="border-primary/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <LayoutList className="h-4 w-4" />
                                    Total Luaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{grandTotal}</div>
                                <p className="mt-1 text-xs text-muted-foreground">jurnal disetujui</p>
                            </CardContent>
                        </Card>

                        {/* Per category */}
                        {statsByCategory.map((stat) => (
                            <Card key={stat.category}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        {stat.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.total}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {grandTotal > 0
                                            ? `${Math.round((stat.total / grandTotal) * 100)}% dari total`
                                            : '—'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Per year (compact, only if few years) */}
                        {statsByYear.length > 0 && statsByYear.length <= 4 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Per Tahun
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    {statsByYear.map((s) => (
                                        <div key={s.year} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{s.year}</span>
                                            <span className="font-semibold">{s.total}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* ── Print summary table (hidden on screen) ── */}
                    <div className="print-only mb-4">
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12pt' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #999', padding: '4pt 6pt', background: '#f0f0f0', textAlign: 'left' }}>
                                        Kategori
                                    </th>
                                    <th style={{ border: '1px solid #999', padding: '4pt 6pt', background: '#f0f0f0', textAlign: 'center' }}>
                                        Jumlah Luaran
                                    </th>
                                    <th style={{ border: '1px solid #999', padding: '4pt 6pt', background: '#f0f0f0', textAlign: 'center' }}>
                                        Persentase
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {statsByCategory.map((s) => (
                                    <tr key={s.category}>
                                        <td style={{ border: '1px solid #999', padding: '4pt 6pt' }}>{s.label}</td>
                                        <td style={{ border: '1px solid #999', padding: '4pt 6pt', textAlign: 'center' }}>{s.total}</td>
                                        <td style={{ border: '1px solid #999', padding: '4pt 6pt', textAlign: 'center' }}>
                                            {grandTotal > 0 ? `${Math.round((s.total / grandTotal) * 100)}%` : '—'}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ border: '1px solid #999', padding: '4pt 6pt', fontWeight: 'bold' }}>Total</td>
                                    <td style={{ border: '1px solid #999', padding: '4pt 6pt', textAlign: 'center', fontWeight: 'bold' }}>
                                        {grandTotal}
                                    </td>
                                    <td style={{ border: '1px solid #999', padding: '4pt 6pt', textAlign: 'center' }}>100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ── Section title ── */}
                    <div className="mb-3 flex items-center gap-2">
                        <LayoutList className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Daftar Luaran</h2>
                        <Badge variant="secondary" className="ml-1">
                            {registrations.length} entri
                        </Badge>
                    </div>

                    {/* ── Main list table ── */}
                    {registrations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground">
                            <LayoutList className="mb-3 h-12 w-12 opacity-30" />
                            <p className="font-medium">Tidak ada data luaran</p>
                            <p className="mt-1 text-sm">
                                {hasActiveFilters ? 'Coba ubah atau hapus filter yang aktif.' : 'Belum ada registrasi yang disetujui.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[900px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10 text-center">No.</TableHead>
                                            <TableHead>Nama Jurnal</TableHead>
                                            <TableHead className="w-32">ISSN / E-ISSN</TableHead>
                                            <TableHead>Perguruan Tinggi</TableHead>
                                            <TableHead>Program Pembinaan</TableHead>
                                            <TableHead className="w-28 text-center">Kategori</TableHead>
                                            <TableHead className="w-24 text-center">Tahun</TableHead>
                                            <TableHead className="w-32">Tgl. Daftar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations.map((reg, idx) => (
                                            <TableRow
                                                key={reg.id}
                                                className="print:border-b print:border-gray-300"
                                            >
                                                {/* No */}
                                                <TableCell className="text-center text-muted-foreground">
                                                    {idx + 1}
                                                </TableCell>

                                                {/* Journal */}
                                                <TableCell>
                                                    <div className="font-medium leading-snug">
                                                        {reg.journal.title}
                                                    </div>
                                                    {reg.journal.sinta_rank_label && (
                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                            {reg.journal.sinta_rank_label}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* ISSN */}
                                                <TableCell className="text-sm">
                                                    <div>{reg.journal.issn}</div>
                                                    {reg.journal.e_issn && (
                                                        <div className="text-xs text-muted-foreground">
                                                            e: {reg.journal.e_issn}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* University */}
                                                <TableCell className="text-sm">
                                                    {reg.journal.university.short_name ||
                                                        reg.journal.university.name}
                                                </TableCell>

                                                {/* Programme */}
                                                <TableCell className="text-sm">
                                                    {reg.pembinaan.name}
                                                </TableCell>

                                                {/* Category */}
                                                <TableCell className="text-center">
                                                    <Badge variant={categoryBadgeVariant(reg.pembinaan.category)}>
                                                        {CATEGORY_LABELS[reg.pembinaan.category] ??
                                                            reg.pembinaan.category}
                                                    </Badge>
                                                </TableCell>

                                                {/* Year */}
                                                <TableCell className="text-center text-sm font-medium">
                                                    {new Date(reg.registered_at).getFullYear()}
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDateShort(reg.registered_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* ── Print footer ── */}
                    <div className="print-only mt-6 flex justify-between text-xs text-gray-500">
                        <span>Sistem Informasi Jurnal – JurnalMU</span>
                        <span>Dicetak: {formatDate(generatedAt)}</span>
                    </div>

                    {/* ── On-screen info bar ── */}
                    <div className="no-print mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                        <span>
                            Menampilkan <span className="font-medium">{registrations.length}</span> luaran
                            {hasActiveFilters && (
                                <span>
                                    {filters.category
                                        ? ` · Kategori: ${CATEGORY_LABELS[filters.category] ?? filters.category}`
                                        : ''}
                                    {filters.year ? ` · Tahun: ${filters.year}` : ''}
                                </span>
                            )}
                        </span>
                        <span className="text-xs">
                            Data per: {formatDateShort(generatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
