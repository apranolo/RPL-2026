/**
 * Admin Output Verification Index Page
 *
 * @description
 * Displays a list of research outputs awaiting admin verification.
 * Provides search, filter by kategori/status, pagination, and verify action via VerifyModal.
 *
 * @route GET /admin/output-verify
 */
import VerifyModal from '@/components/VerifyModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, FileText, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Verifikasi Luaran', href: '/admin/output-verify' },
];

interface ResearchOutput {
    id: number;
    judul: string;
    kategori: string;
    status: string;
    file_path: string | null;
    keterangan: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    proposal?: {
        id: number;
        judul: string;
    } | null;
}

interface Props {
    outputs: {
        data: ResearchOutput[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search: string;
        kategori: string;
        status: string;
    };
    kategoriOptions: Record<string, string>;
    statusOptions: Record<string, string>;
}

export default function Index({ outputs, filters, kategoriOptions, statusOptions }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedOutput, setSelectedOutput] = useState<ResearchOutput | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleSearch = () => {
        router.get(
            '/admin/output-verify',
            { search, kategori: filters.kategori, status: filters.status },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/output-verify',
            { ...filters, search, [key]: value === '__all__' ? '' : value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleVerify = (output: ResearchOutput) => {
        setSelectedOutput(output);
        setModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { class: string; icon: React.ReactNode }> = {
            draft: {
                class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                icon: <FileText className="h-3 w-3" />,
            },
            submitted: {
                class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                icon: <ClipboardCheck className="h-3 w-3" />,
            },
            approved: {
                class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
                icon: <CheckCircle2 className="h-3 w-3" />,
            },
            rejected: {
                class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                icon: <XCircle className="h-3 w-3" />,
            },
        };
        return config[status] || config.draft;
    };

    const getKategoriBadgeClass = (kategori: string) => {
        const map: Record<string, string> = {
            jurnal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            buku: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            hki: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            prosiding: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            produk: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return map[kategori] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verifikasi Luaran Penelitian" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Verifikasi Luaran Penelitian</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Kelola dan verifikasi luaran penelitian yang diajukan oleh dosen.</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                            {outputs.total} Luaran
                        </Badge>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                            <XCircle className="h-4 w-4 shrink-0" />
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                {/* Search */}
                                <div className="flex-1">
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cari Judul</label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search-output"
                                            placeholder="Cari berdasarkan judul luaran..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Kategori Filter */}
                                <div className="w-full sm:w-44">
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Kategori</label>
                                    <Select value={filters.kategori || '__all__'} onValueChange={(v) => handleFilter('kategori', v)}>
                                        <SelectTrigger id="filter-kategori">
                                            <SelectValue placeholder="Semua Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Semua Kategori</SelectItem>
                                            {Object.entries(kategoriOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="w-full sm:w-44">
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                                    <Select value={filters.status || 'submitted'} onValueChange={(v) => handleFilter('status', v)}>
                                        <SelectTrigger id="filter-status">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            {Object.entries(statusOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Search Button */}
                                <Button onClick={handleSearch} className="shrink-0">
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Judul Luaran</TableHead>
                                        <TableHead>Pengusul</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outputs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ClipboardCheck className="h-10 w-10 text-muted-foreground/40" />
                                                    <p className="text-sm text-muted-foreground">Tidak ada luaran yang menunggu verifikasi.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        outputs.data.map((output, index) => {
                                            const statusConfig = getStatusBadge(output.status);
                                            return (
                                                <TableRow key={output.id}>
                                                    <TableCell className="font-medium text-muted-foreground">
                                                        {(outputs.current_page - 1) * outputs.per_page + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs">
                                                            <p className="truncate font-medium">{output.judul}</p>
                                                            {output.proposal && (
                                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                                    Proposal: {output.proposal.judul}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{output.user.name}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getKategoriBadgeClass(output.kategori)}>
                                                            {output.kategori.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`gap-1 ${statusConfig.class}`}>
                                                            {statusConfig.icon}
                                                            {statusOptions[output.status] || output.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(output.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {output.status === 'submitted' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleVerify(output)}
                                                                className="border-primary/30 text-primary hover:bg-primary/10"
                                                            >
                                                                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                                                                Verifikasi
                                                            </Button>
                                                        ) : (
                                                            <Badge variant="outline" className={`text-xs ${statusConfig.class}`}>
                                                                {output.status === 'approved'
                                                                    ? 'Disetujui'
                                                                    : output.status === 'rejected'
                                                                      ? 'Ditolak'
                                                                      : output.status}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {outputs.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {(outputs.current_page - 1) * outputs.per_page + 1}–
                                {Math.min(outputs.current_page * outputs.per_page, outputs.total)} dari {outputs.total} luaran
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={outputs.current_page === 1}
                                    onClick={() =>
                                        router.get(
                                            '/admin/output-verify',
                                            { ...filters, search, page: outputs.current_page - 1 },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {outputs.current_page} / {outputs.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={outputs.current_page === outputs.last_page}
                                    onClick={() =>
                                        router.get(
                                            '/admin/output-verify',
                                            { ...filters, search, page: outputs.current_page + 1 },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Verify Modal */}
            <VerifyModal open={modalOpen} onOpenChange={setModalOpen} output={selectedOutput} verifyUrl="/admin/output-verify" />
        </AppLayout>
    );
}
