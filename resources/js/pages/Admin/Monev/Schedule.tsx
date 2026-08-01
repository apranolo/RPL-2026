/**
 * MonevSchedule Component
 *
 * @description
 * Management page for Monitoring & Evaluation (Monev) schedules.
 * Admin can view all scheduled Monev sessions, create new ones,
 * and view progress reports that are pending review.
 *
 * @route GET /admin/monev-schedules
 * @route GET /admin/monev-schedules/pending
 *
 * @features
 * - Tabbed view: Jadwal Monev & Laporan Pending
 * - Create new Monev Schedule via dialog form
 * - View pending progress reports needing review
 * - Status badges with color coding
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Clock, FileText, MapPin, Plus, UserCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Monev Schedule',
        href: route('admin.monev-schedules.index'),
    },
];

interface Evaluator {
    id: number;
    name: string;
    email: string;
}

interface Proposal {
    id: number;
    title?: string;
    judul?: string;
    user?: {
        id: number;
        name: string;
    };
}

interface Contract {
    id: number;
    contract_number?: string;
    title?: string;
    proposal?: Proposal;
}

interface MonevSchedule {
    id: number;
    contract_id: number | null;
    evaluator_id: number;
    date: string;
    time: string | null;
    location: string | null;
    status: 'scheduled' | 'done' | 'cancelled';
    contract?: Contract;
    evaluator?: Evaluator;
    created_at: string;
}

interface ProgressReport {
    id: number;
    proposal_id: number;
    user_id: number;
    title: string;
    content: string;
    progress_percentage: number;
    report_period: string;
    status: string;
    submitted_at: string | null;
    proposal?: Proposal;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}

interface Props {
    schedules: MonevSchedule[];
    contracts: Contract[];
    evaluators: Evaluator[];
    pendingReports?: ProgressReport[];
    activeTab?: string;
}

export default function Schedule({ schedules, contracts, evaluators, pendingReports = [], activeTab = 'schedules' }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        contract_id: '',
        evaluator_id: '',
        date: '',
        time: '',
        location: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(route('admin.monev-schedules.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                toast.success('Jadwal monev berhasil dibuat.');
            },
            onError: () => {
                toast.error('Gagal membuat jadwal. Periksa kembali form.');
            },
        });
    };

    const handleTabChange = (value: string) => {
        if (value === 'schedules') {
            router.get(route('admin.monev-schedules.index'), {}, { preserveState: true });
        } else if (value === 'pending') {
            router.get(route('admin.monev-schedules.pending'), {}, { preserveState: true });
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            scheduled: { variant: 'default', label: 'Dijadwalkan' },
            done: { variant: 'secondary', label: 'Selesai' },
            cancelled: { variant: 'destructive', label: 'Dibatalkan' },
        };
        const { variant, label } = config[status] ?? { variant: 'outline' as const, label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const getReportStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            draft: { variant: 'outline', label: 'Draft' },
            submitted: { variant: 'default', label: 'Menunggu Review' },
            reviewed: { variant: 'secondary', label: 'Sudah Direview' },
        };
        const { variant, label } = config[status] ?? { variant: 'outline' as const, label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getContractLabel = (contract?: Contract) => {
        if (!contract) return '-';
        return contract.title || contract.contract_number || `Kontrak #${contract.id}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jadwal Monev" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Monitoring & Evaluasi</h1>
                                <p className="mt-1 text-muted-foreground">Kelola jadwal monitoring dan evaluasi penelitian</p>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Buat Jadwal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Buat Jadwal Monev Baru</DialogTitle>
                                        <DialogDescription>Isi detail jadwal monitoring dan evaluasi.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contract_id">Kontrak</Label>
                                            <Select value={data.contract_id} onValueChange={(v) => setData('contract_id', v)}>
                                                <SelectTrigger id="contract_id">
                                                    <SelectValue placeholder="Pilih kontrak..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contracts.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {getContractLabel(c)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.contract_id && <p className="mt-1 text-sm text-red-600">{errors.contract_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="evaluator_id">Evaluator</Label>
                                            <Select value={data.evaluator_id} onValueChange={(v) => setData('evaluator_id', v)}>
                                                <SelectTrigger id="evaluator_id">
                                                    <SelectValue placeholder="Pilih evaluator..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {evaluators.map((e) => (
                                                        <SelectItem key={e.id} value={String(e.id)}>
                                                            {e.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.evaluator_id && <p className="mt-1 text-sm text-red-600">{errors.evaluator_id}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date">Tanggal</Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    required
                                                    value={data.date}
                                                    onChange={(e) => setData('date', e.target.value)}
                                                />
                                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="time">Waktu</Label>
                                                <Input id="time" type="time" value={data.time} onChange={(e) => setData('time', e.target.value)} />
                                                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Lokasi</Label>
                                            <Input
                                                id="location"
                                                type="text"
                                                placeholder="Misal: Ruang Rapat Lt.3, Zoom Meeting, dll."
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                            />
                                            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="schedules">Jadwal Monev</TabsTrigger>
                            <TabsTrigger value="pending">
                                Laporan Pending
                                {pendingReports.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                        {pendingReports.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Jadwal Monev */}
                        <TabsContent value="schedules">
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kontrak</TableHead>
                                            <TableHead>Evaluator</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead>Lokasi</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <CalendarDays className="mb-2 h-8 w-8" />
                                                        <p>Belum ada jadwal monev</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            schedules.map((schedule) => (
                                                <TableRow key={schedule.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{getContractLabel(schedule.contract)}</div>
                                                            {schedule.contract?.proposal?.user && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {schedule.contract.proposal.user.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                            <span>{schedule.evaluator?.name ?? '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <CalendarDays className="h-3 w-3" />
                                                            <span>{formatDate(schedule.date)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {schedule.time ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{schedule.time}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {schedule.location ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{schedule.location}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">{getStatusBadge(schedule.status)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="space-y-4 md:hidden">
                                {schedules.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center p-6 py-12 text-center text-muted-foreground">
                                            <CalendarDays className="mb-2 h-12 w-12" />
                                            <p>Belum ada jadwal monev</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    schedules.map((schedule) => (
                                        <Card key={schedule.id} className="overflow-hidden">
                                            <CardContent className="space-y-3 p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">{getContractLabel(schedule.contract)}</div>
                                                        {schedule.contract?.proposal?.user && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {schedule.contract.proposal.user.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(schedule.status)}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Evaluator</span>
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <UserCheck className="h-3 w-3" />
                                                            <span>{schedule.evaluator?.name ?? '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Tanggal</span>
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <CalendarDays className="h-3 w-3" />
                                                            <span>{formatDate(schedule.date)}</span>
                                                        </div>
                                                    </div>
                                                    {schedule.time && (
                                                        <div>
                                                            <span className="text-muted-foreground">Waktu</span>
                                                            <div className="mt-1 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{schedule.time}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {schedule.location && (
                                                        <div>
                                                            <span className="text-muted-foreground">Lokasi</span>
                                                            <div className="mt-1 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{schedule.location}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Laporan Pending */}
                        <TabsContent value="pending">
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judul Laporan</TableHead>
                                            <TableHead>Peneliti</TableHead>
                                            <TableHead>Proposal</TableHead>
                                            <TableHead>Periode</TableHead>
                                            <TableHead className="text-center">Progres</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingReports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FileText className="mb-2 h-8 w-8" />
                                                        <p>Tidak ada laporan yang menunggu review</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingReports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{report.title}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                            <span>{report.user?.name ?? '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{report.proposal?.judul || report.proposal?.title || '-'}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{report.report_period}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="mx-auto flex w-16 items-center gap-1">
                                                            <div className="h-2 flex-1 rounded-full bg-muted">
                                                                <div
                                                                    className="h-2 rounded-full bg-primary transition-all"
                                                                    style={{ width: `${report.progress_percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{report.progress_percentage}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">{getReportStatusBadge(report.status)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="space-y-4 md:hidden">
                                {pendingReports.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center p-6 py-12 text-center text-muted-foreground">
                                            <FileText className="mb-2 h-12 w-12" />
                                            <p>Tidak ada laporan yang menunggu review</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    pendingReports.map((report) => (
                                        <Card key={report.id} className="overflow-hidden">
                                            <CardContent className="space-y-3 p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="font-medium">{report.title}</div>
                                                    {getReportStatusBadge(report.status)}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Peneliti</span>
                                                        <div className="mt-1">{report.user?.name ?? '-'}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Periode</span>
                                                        <div className="mt-1">{report.report_period}</div>
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-sidebar-border/50 bg-sidebar p-3">
                                                    <div className="mb-1 text-center text-sm text-muted-foreground">Progres</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-primary transition-all"
                                                                style={{ width: `${report.progress_percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium">{report.progress_percentage}%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
