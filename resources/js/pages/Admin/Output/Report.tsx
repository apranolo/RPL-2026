/**
 * OutputReport Component
 *
 * @description
 * Printable recap (rekap) of luaran (outputs) — verified research outputs.
 * Displays a numbered list of outputs grouped with their info,
 * plus summary cards for totals per type and per year.
 *
 * On-screen: filter toolbar (type + year) + Print button are visible.
 * On print:  only the document header, summary, and table are printed.
 *
 * @route GET /admin/output/report
 *
 * @props
 * - outputs        : flat list of verified ResearchOutput with relations
 * - statsByType    : [{category (type), label, total}]
 * - statsByYear    : [{year, total}]
 * - filters        : {type?, year?}
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

interface User {
    id: number;
    name: string;
    university: University;
}

interface Output {
    id: number;
    title: string;
    type: 'Jurnal' | 'Buku' | 'HKI' | 'Produk';
    year: string;
    status: string;
    user: User;
    created_at: string; // ISO
}

interface TypeStat {
    category: string;
    label: string;
    total: number;
}

interface YearlyStat {
    year: number;
    total: number;
}

interface Filters {
    type?: string;
    year?: string;
}

interface Props {
    outputs: Output[];
    statsByType: TypeStat[];
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

function typeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
    if (type === 'Jurnal') return 'default';
    if (type === 'Buku') return 'secondary';
    return 'outline';
}

/* ─────────────────────────────────────────────
   Year list helper — unique years from data
───────────────────────────────────────────── */
function uniqueYears(outputs: Output[]): number[] {
    const set = new Set(outputs.map((o) => Number(o.year)));
    return Array.from(set).sort((a, b) => a - b);
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function OutputReport({ outputs, statsByType, statsByYear, filters, generatedAt }: Props) {
    const grandTotal = statsByType.reduce((s, c) => s + c.total, 0);

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

    const hasActiveFilters = Boolean(filters.type || filters.year);

    /* Available years from statsByYear + local data */
    const yearOptions = statsByYear.length > 0 ? statsByYear.map((s) => s.year) : uniqueYears(outputs);

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
                                    Daftar luaran dosen (status: terverifikasi)
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    id="btn-export-excel"
                                    variant="outline"
                                    onClick={() => {
                                        const url = new URL(route('admin.output.export'), window.location.origin);
                                        if (filters.type) url.searchParams.set('type', filters.type);
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
                            Rekap Luaran Dosen
                        </h1>
                        {(filters.type || filters.year) && (
                            <p className="mt-1 text-sm">
                                {filters.type ? `Jenis Luaran: ${filters.type}` : ''}
                                {filters.type && filters.year ? ' · ' : ''}
                                {filters.year ? `Tahun Capaian: ${filters.year}` : ''}
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

                            {/* Type filter */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Jenis Luaran</span>
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(v) => applyFilter({ type: v === 'all' ? '' : v })}
                                >
                                    <SelectTrigger id="filter-type" className="w-44">
                                        <SelectValue placeholder="Semua Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis</SelectItem>
                                        <SelectItem value="Jurnal">Jurnal</SelectItem>
                                        <SelectItem value="Buku">Buku</SelectItem>
                                        <SelectItem value="HKI">HKI</SelectItem>
                                        <SelectItem value="Produk">Produk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year filter */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Tahun Capaian</span>
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
                                <p className="mt-1 text-xs text-muted-foreground">luaran terverifikasi</p>
                            </CardContent>
                        </Card>

                        {/* Per type */}
                        {statsByType.map((stat) => (
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
                                        Jenis Luaran
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
                                {statsByType.map((s) => (
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
                            {outputs.length} entri
                        </Badge>
                    </div>

                    {/* ── Main list table ── */}
                    {outputs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground">
                            <LayoutList className="mb-3 h-12 w-12 opacity-30" />
                            <p className="font-medium">Tidak ada data luaran</p>
                            <p className="mt-1 text-sm">
                                {hasActiveFilters ? 'Coba ubah atau hapus filter yang aktif.' : 'Belum ada luaran yang terverifikasi.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[900px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10 text-center">No.</TableHead>
                                            <TableHead>Judul Luaran</TableHead>
                                            <TableHead className="w-28 text-center">Jenis Luaran</TableHead>
                                            <TableHead className="w-24 text-center">Tahun</TableHead>
                                            <TableHead>Dosen Pengusul</TableHead>
                                            <TableHead>Perguruan Tinggi</TableHead>
                                            <TableHead className="w-28 text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {outputs.map((out, idx) => (
                                            <TableRow
                                                key={out.id}
                                                className="print:border-b print:border-gray-300"
                                            >
                                                {/* No */}
                                                <TableCell className="text-center text-muted-foreground">
                                                    {idx + 1}
                                                </TableCell>

                                                {/* Title */}
                                                <TableCell>
                                                    <div className="font-medium leading-snug">
                                                        {out.title}
                                                    </div>
                                                </TableCell>

                                                {/* Type */}
                                                <TableCell className="text-center">
                                                    <Badge variant={typeBadgeVariant(out.type)}>
                                                        {out.type}
                                                    </Badge>
                                                </TableCell>

                                                {/* Year */}
                                                <TableCell className="text-center text-sm font-medium">
                                                    {out.year}
                                                </TableCell>

                                                {/* User */}
                                                <TableCell className="text-sm">
                                                    {out.user?.name || '-'}
                                                </TableCell>
                                                
                                                {/* University */}
                                                <TableCell className="text-sm">
                                                    {out.user?.university?.short_name || out.user?.university?.name || '-'}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="text-center text-sm font-medium text-green-600 dark:text-green-500">
                                                    Terverifikasi
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
                            Menampilkan <span className="font-medium">{outputs.length}</span> luaran
                            {hasActiveFilters && (
                                <span>
                                    {filters.type ? ` · Jenis: ${filters.type}` : ''}
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
