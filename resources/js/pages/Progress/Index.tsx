/**
 * ProgressIndex Component
 *
 * @description
 * Displays a list of progress reports (laporan kemajuan) for the authenticated user (Dosen).
 * Supports search and status filtering with pagination.
 *
 * @route GET /user/progress
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, FileText, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface Evaluation {
    id: number;
    score: number | null;
    status: string;
    reviewer: {
        id: number;
        name: string;
    };
}

interface Proposal {
    id: number;
    title: string;
}

interface Contract {
    id: number;
    nomor_kontrak: string;
}

interface ProgressReport {
    id: number;
    title: string;
    content: string;
    report_type: 'logbook' | 'laporan_kemajuan' | 'laporan_akhir';
    report_date: string;
    progress_percentage: number;
    report_period: string;
    status: 'draft' | 'submitted' | 'reviewed';
    submitted_at: string | null;
    created_at: string;
    proposal: Proposal;
    contract: Contract | null;
    evaluations: Evaluation[];
}

interface Filters {
    search: string;
    status: string;
    report_type: string;
}

interface Props {
    progressReports: {
        data: ProgressReport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: Filters;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    reviewed: { label: 'Reviewed', variant: 'outline' },
};

const reportTypeConfig: Record<string, string> = {
    logbook: 'Logbook',
    laporan_kemajuan: 'Laporan Kemajuan',
    laporan_akhir: 'Laporan Akhir',
};

export default function ProgressIndex({ progressReports, filters: initialFilters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [filters, setFilters] = useState<Filters>(initialFilters || { search: '', status: '', report_type: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Kemajuan', href: route('user.progress.index') },
    ];

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('user.progress.index'),
            {
                ...filters,
                status: filters.status || undefined,
                report_type: filters.report_type || undefined,
            },
            { preserveState: true },
        );
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        router.get(
            route('user.progress.index'),
            {
                ...newFilters,
                status: newFilters.status || undefined,
                report_type: newFilters.report_type || undefined,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setFilters({ search: '', status: '', report_type: '' });
        router.get(route('user.progress.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kemajuan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Kemajuan</h1>
                        <p className="text-muted-foreground">Daftar laporan kemajuan penelitian Anda</p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{flash.error}</div>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari laporan..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.report_type} onValueChange={(value) => handleFilterChange('report_type', value)}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="logbook">Logbook</SelectItem>
                                    <SelectItem value="laporan_kemajuan">Laporan Kemajuan</SelectItem>
                                    <SelectItem value="laporan_akhir">Laporan Akhir</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm">
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Judul Laporan</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Proposal</TableHead>
                                    <TableHead>Tgl Pelaporan</TableHead>
                                    <TableHead>Periode</TableHead>
                                    <TableHead className="text-center">Progres</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Evaluasi</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {progressReports.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-10 w-10 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Belum ada laporan kemajuan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    progressReports.data.map((report, index) => (
                                        <TableRow key={report.id}>
                                            <TableCell>{(progressReports.current_page - 1) * progressReports.per_page + index + 1}</TableCell>
                                            <TableCell className="font-medium">{report.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{reportTypeConfig[report.report_type] ?? report.report_type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{report.proposal?.title ?? '-'}</TableCell>
                                            <TableCell className="text-sm">{report.report_date}</TableCell>
                                            <TableCell>{report.report_period}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className="h-full rounded-full bg-green-500"
                                                            style={{ width: `${report.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs">{report.progress_percentage}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={statusConfig[report.status]?.variant ?? 'secondary'}>
                                                    {statusConfig[report.status]?.label ?? report.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {report.evaluations.length > 0 ? (
                                                    <Badge variant="outline">
                                                        {report.evaluations.filter((e) => e.status === 'reviewed').length}/{report.evaluations.length}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('user.progress.index')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {progressReports.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {progressReports.from} - {progressReports.to} dari {progressReports.total} laporan
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={progressReports.current_page === 1}
                                onClick={() => router.get(progressReports.links[0]?.url ?? '')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={progressReports.current_page === progressReports.last_page}
                                onClick={() => router.get(progressReports.links[progressReports.links.length - 1]?.url ?? '')}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
