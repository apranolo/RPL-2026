import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, CheckCircle, Clock, FileText, PieChart } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Monev Report',
        href: '/admin/monev/rekap-keseluruhan',
    },
];

interface DataProp {
    ringkasan: {
        total_program: number;
        program_selesai: number;
        program_berjalan: number;
        program_tertunda: number;
    };
    anggaran: {
        total_anggaran: number;
        anggaran_terserap: number;
        persentase_serapan: number;
    };
    kinerja_wilayah: {
        wilayah: string;
        skor: number;
        status: string;
    }[];
    kegiatan_terbaru: {
        id: number;
        nama_kegiatan: string;
        progres: number;
        status: string;
        tanggal_update: string;
    }[];
}

interface Props {
    data: DataProp;
}

export default function MonevReport({ data }: Props) {
    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'berjalan':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'selesai':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'tertunda':
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Keseluruhan Monev" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Rekap Status Progres Penelitian</h1>
                    <p className="mt-2 text-muted-foreground">Ringkasan keseluruhan monitoring dan evaluasi program penelitian.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Program</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.total_program}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Program Selesai</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.program_selesai}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Program Berjalan</CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.program_berjalan}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Program Tertunda</CardTitle>
                            <Clock className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.ringkasan.program_tertunda}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Budget & Territory */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Serapan Anggaran
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
                                    <div 
                                        className="h-full bg-primary transition-all" 
                                        style={{ width: `${data.anggaran.persentase_serapan}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kinerja Wilayah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Wilayah</TableHead>
                                        <TableHead className="text-right">Skor</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.kinerja_wilayah.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.wilayah}</TableCell>
                                            <TableCell className="text-right">{item.skor}</TableCell>
                                            <TableCell className="text-right">{item.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kegiatan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nama Kegiatan</TableHead>
                                        <TableHead>Progres</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Tanggal Update</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.kegiatan_terbaru.map((kegiatan) => (
                                        <TableRow key={kegiatan.id}>
                                            <TableCell className="font-medium">{kegiatan.id}</TableCell>
                                            <TableCell>{kegiatan.nama_kegiatan}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                                                        <div 
                                                            className="h-full bg-blue-500" 
                                                            style={{ width: `${kegiatan.progres}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{kegiatan.progres}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(kegiatan.status)}>
                                                    {kegiatan.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{kegiatan.tanggal_update}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
