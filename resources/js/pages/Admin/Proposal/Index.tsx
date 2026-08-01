/**
 * Admin/Proposal/Index — Super Admin
 *
 * @description
 * Halaman daftar semua proposal penelitian untuk peran Super Admin.
 * Menampilkan tabel monitoring proposal dengan kemampuan verifikasi administrasi
 * (Validasi / Tolak) langsung dari halaman ini.
 *
 * @features
 * - Search berdasarkan judul proposal
 * - Filter berdasarkan status proposal (Draft / Submitted / Valid / Ditolak)
 * - Tabel: Judul, Pengusul, Skema, Status, Tanggal, Aksi
 * - Tombol Validasi (hanya aktif untuk status Submitted)
 * - Modal Tolak dengan input alasan penolakan
 * - Badge status berwarna semantik
 * - Flash messages untuk feedback aksi
 * - Paginasi hasil
 *
 * @route GET /admin/proposals
 */
import ActionButtons from '@/components/ActionButtons';
import AssignModal from '@/components/AssignModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, FileText, Search, X, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proposal Penelitian', href: '/admin/proposals' },
];

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface ProposalUser {
    id: number;
    name: string;
    email: string;
}

interface ResearchSchema {
    id: number;
    name: string;
}

interface Proposal {
    id: number;
    title: string;
    description: string;
    status_proposal: string;
    rejection_reason: string | null;
    file_dokumen_proposal: string | null;
    user: ProposalUser | null;
    research_schema: ResearchSchema | null;
    created_at: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProposalsPaginated {
    data: Proposal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    proposals: ProposalsPaginated;
    filters: {
        search?: string;
        status?: string;
    };
    statusOptions: FilterOption[];
}

// ─── Status Badge Helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        Draft: { label: 'Draft', variant: 'secondary' },
        Submitted: { label: 'Menunggu Review', variant: 'outline' },
        Administrasi_Valid: { label: 'Valid Administrasi', variant: 'default' },
        Ditolak: { label: 'Ditolak', variant: 'destructive' },
    };
    const { label, variant } = config[status] ?? { label: status, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ rejection_reason: '' });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.proposals.reject', { proposal: proposal.id }), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Tolak Proposal</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Anda akan menolak: <span className="font-medium text-foreground">{proposal.title}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rejection_reason" className="mb-1.5 block text-sm font-medium text-foreground">
                            Alasan Penolakan <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="rejection_reason"
                            ref={textareaRef}
                            rows={4}
                            value={data.rejection_reason}
                            onChange={(e) => setData('rejection_reason', e.target.value)}
                            placeholder="Tuliskan alasan penolakan secara jelas (min. 10 karakter)..."
                            className={`w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none ${errors.rejection_reason ? 'border-destructive' : 'border-border'}`}
                        />
                        {errors.rejection_reason && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                {errors.rejection_reason}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{data.rejection_reason.length}/500 karakter</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? 'Memproses...' : 'Tolak Proposal'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProposalIndex({ proposals, filters, statusOptions }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [rejectTarget, setRejectTarget] = useState<Proposal | null>(null);
    const [assignTarget, setAssignTarget] = useState<Proposal | null>(null);
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (flash?.success) setFlashMessage({ type: 'success', text: flash.success });
        else if (flash?.error) setFlashMessage({ type: 'error', text: flash.error });
        else setFlashMessage(null);
        const timer = setTimeout(() => setFlashMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.proposals.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get(route('admin.proposals.index'));
    };

    const handleConfirmAssign = () => {
        if (!assignTarget) return;
        const targetId = assignTarget.id;
        setAssignTarget(null);
        router.get('/admin/reviewer/assign', { proposal_id: targetId });
    };

    const hasActiveFilters = !!(search || statusFilter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proposal Penelitian — Admin" />

            {/* Flash Message */}
            {flashMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${flashMessage.type === 'success' ? 'border-border bg-card text-foreground' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}
                >
                    {flashMessage.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {flashMessage.text}
                </div>
            )}

            {/* Reject Modal */}
            {rejectTarget && <RejectModal proposal={rejectTarget} onClose={() => setRejectTarget(null)} />}

            {/* Assign Modal */}
            <AssignModal
                open={!!assignTarget}
                onClose={() => setAssignTarget(null)}
                onConfirm={handleConfirmAssign}
                proposalTitle={assignTarget?.title}
            />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Proposal Penelitian</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Daftar seluruh proposal yang diajukan. Validasi atau tolak proposal berstatus Submitted.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{proposals.total} proposal</span>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <Input
                                    id="search-proposals"
                                    type="text"
                                    placeholder="Cari judul proposal..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="filter-status" className="w-[200px] border-border bg-background text-sm">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Status</SelectItem>
                                    {statusOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" id="btn-search-proposals" className="shrink-0">
                                Cari
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleClearFilters}
                                    className="shrink-0 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-border bg-card">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="w-[32%] text-muted-foreground">Judul Proposal</TableHead>
                                    <TableHead className="text-muted-foreground">Pengusul</TableHead>
                                    <TableHead className="text-muted-foreground">Skema Penelitian</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-muted-foreground">Tanggal</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proposals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                            <p className="text-sm">Tidak ada proposal ditemukan.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    proposals.data.map((proposal) => (
                                        <TableRow key={proposal.id} className="border-border">
                                            <TableCell>
                                                <p className="line-clamp-2 font-medium text-foreground">{proposal.title}</p>
                                            </TableCell>
                                            <TableCell>
                                                {proposal.user ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{proposal.user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{proposal.user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-foreground">
                                                    {proposal.research_schema?.name ?? <span className="text-muted-foreground">—</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={proposal.status_proposal} />
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{proposal.created_at}</TableCell>
                                            <TableCell className="text-right">
                                                <ActionButtons
                                                    proposalId={proposal.id}
                                                    proposalTitle={proposal.title}
                                                    status={proposal.status_proposal}
                                                    onReject={() => setRejectTarget(proposal)}
                                                    onAssign={() => setAssignTarget(proposal)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {proposals.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {(proposals.current_page - 1) * proposals.per_page + 1}–
                            {Math.min(proposals.current_page * proposals.per_page, proposals.total)} dari {proposals.total} proposal
                        </p>
                        <div className="flex items-center gap-1">
                            {proposals.links.map((link, idx) => {
                                const isFirst = idx === 0;
                                const isLast = idx === proposals.links.length - 1;
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground hover:bg-muted'} disabled:pointer-events-none disabled:opacity-40`}
                                    >
                                        {isFirst ? (
                                            <ChevronLeft className="h-4 w-4" />
                                        ) : isLast ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
