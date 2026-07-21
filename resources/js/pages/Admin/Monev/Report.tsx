import AlertWarning from '@/components/AlertWarning';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Activity, CheckCircle, ChevronLeft, ChevronRight, Clock, FileText, PieChart, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface DataProp {
    ringkasan: {
        total_penelitian: number;
        penelitian_selesai: number;
        penelitian_berjalan: number;
        penelitian_tertunda: number;
    };
    anggaran: {
        total_anggaran: number;
        anggaran_terserap: number;
        persentase_serapan: number;
    };
    kinerja_fakultas: {
        fakultas: string;
        skor: number;
        status: string;
    }[];
    penelitian_terbaru: PaginatedData<{
        id: number;
        judul_penelitian: string;
        nama_dosen: string;
        progres: number;
        status: string;
        tanggal_update: string;
        is_late?: boolean;
    }>;
}

interface Props {
    data: DataProp;
    filters: {
        search: string;
        status: string;
    };
}

export default function MonevReport({ data, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Safely determine current routing context for breadcrumbs
    const isKampusAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin-kampus');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            isKampusAdmin ? '/admin-kampus/monev/rekap-keseluruhan' : '/admin/monev/rekap-keseluruhan',
            {
                search,
                status: statusFilter === 'all' ? '' : statusFilter,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        router.get(isKampusAdmin ? '/admin-kampus/monev/rekap-keseluruhan' : '/admin/monev/rekap-keseluruhan');
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'berjalan':
            case 'active':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'selesai':
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'tertunda':
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Monev Report',
            href: isKampusAdmin ? '/admin-kampus/monev/rekap-keseluruhan' : '/admin/monev/rekap-keseluruhan',
        },
    ];

    const handleDecide = (id: number, action: 'Lanjut' | 'Stop') => {
        if (
            confirm(
                `Apakah Anda yakin ingin mengubah status penelitian ini menjadi ${action === 'Lanjut' ? 'Lanjut (Berjalan)' : 'Stop (Tertunda)'}?`,
            )
        ) {
            router.post(
                isKampusAdmin ? '/admin-kampus/monev/decide-action' : '/admin/monev/decide-action',
                { id, action },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Keseluruhan Monev" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Rekap Status Progres Penelitian</h1>
                    <p className="mt-2 text-muted-foreground">Ringkasan keseluruhan monitoring dan evaluasi laporan kemajuan penelitian.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Penelitian</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.total_penelitian}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Penelitian Selesai</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.penelitian_selesai}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Penelitian Berjalan</CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.penelitian_berjalan}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Penelitian Tertunda</CardTitle>
                            <Clock className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.penelitian_tertunda}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Budget & Territory */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Serapan Anggaran Penelitian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Total Anggaran</span>
                                    <span className="font-medium">{formatRupiah(data.anggaran.total_anggaran)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Terserap</span>
                                    <span className="font-medium text-green-600">{formatRupiah(data.anggaran.anggaran_terserap)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-muted-foreground">Persentase</span>
                                    <span className="text-xl font-bold">{data.anggaran.persentase_serapan}%</span>
                                </div>
                                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${data.anggaran.persentase_serapan}%` }}></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kinerja Bidang Ilmu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bidang Ilmu</TableHead>
                                        <TableHead className="text-right">Skor Rata-rata</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.kinerja_fakultas.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.fakultas}</TableCell>
                                            <TableCell className="text-right">{item.skor}</TableCell>
                                            <TableCell className="text-right">{item.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex w-full flex-col items-center gap-4 sm:flex-row">
                            <div className="relative w-full sm:w-[300px]">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari judul penelitian atau dosen..."
                                    className="w-full pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Berjalan</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="cancelled">Tertunda</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex w-full gap-2 sm:w-auto">
                                <Button type="submit" size="sm" className="w-full sm:w-auto">
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="w-full sm:w-auto">
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Recent Activities Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Penelitian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Judul Penelitian</TableHead>
                                        <TableHead>Dosen Pengusul</TableHead>
                                        <TableHead>Progres Laporan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Update</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.penelitian_terbaru.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-10 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-10 w-10 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Belum ada data penelitian</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.penelitian_terbaru.data.map((kegiatan) => (
                                            <TableRow key={kegiatan.id}>
                                                <TableCell className="font-medium">{kegiatan.id}</TableCell>
                                                <TableCell className="max-w-[300px] truncate" title={kegiatan.judul_penelitian}>
                                                    {kegiatan.judul_penelitian}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span>{kegiatan.nama_dosen}</span>
                                                        {kegiatan.is_late && <AlertWarning />}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                                                            <div className="h-full bg-blue-500" style={{ width: `${kegiatan.progres}%` }}></div>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">{kegiatan.progres}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeColor(kegiatan.status)}>{kegiatan.status}</Badge>
                                                </TableCell>
                                                <TableCell>{kegiatan.tanggal_update}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {kegiatan.status.toLowerCase() !== 'selesai' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 border-green-200 px-2.5 text-xs font-semibold text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/20"
                                                                    onClick={() => handleDecide(kegiatan.id, 'Lanjut')}
                                                                >
                                                                    Lanjut
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 border-red-200 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                                                                    onClick={() => handleDecide(kegiatan.id, 'Stop')}
                                                                >
                                                                    Stop
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {data.penelitian_terbaru.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan {data.penelitian_terbaru.from} - {data.penelitian_terbaru.to} dari {data.penelitian_terbaru.total}{' '}
                                    penelitian
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.penelitian_terbaru.current_page === 1}
                                        onClick={() => router.get(data.penelitian_terbaru.links[0]?.url ?? '')}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.penelitian_terbaru.current_page === data.penelitian_terbaru.last_page}
                                        onClick={() => router.get(data.penelitian_terbaru.links[data.penelitian_terbaru.links.length - 1]?.url ?? '')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
