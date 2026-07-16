/**
 * ContractShow Component
 *
 * @description
 * Detail view page for a research contract draft.
 * Displays contract metadata, related entities, terms, audit trail,
 * and allows status transitions (draft → active → selesai / dibatalkan).
 *
 * @route GET /admin/contracts/{contract}
 *
 * @features
 * - Contract header with number & status badge
 * - Related journal / pembinaan registration / university info
 * - Contract period, terms, and notes
 * - Status transition actions with confirmation dialog
 * - Audit trail (created by, updated by)
 *
 * @author GILANG JA'FAR PRASETYA
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FileText,
    Hash,
    Info,
    User2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: number;
    name: string;
    email: string;
}

interface University {
    id: number;
    name: string;
    short_name?: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    university?: University;
}

interface Pembinaan {
    id: number;
    name: string;
    category: string;
}

interface Proposal {
    id: number;
    judul: string;
    deskripsi?: string;
    user?: User;
}

type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled';

interface Contract {
    id: number;
    contract_number: string;
    title: string;
    status: ContractStatus;
    start_date?: string;
    end_date?: string;
    description?: string;
    notes?: string;
    proposal?: Proposal;
    university?: University;
    creator?: User;
    updater?: User;
    created_at: string;
    updated_at: string;
    status_label?: string;
    status_color?: string;
}

interface Props {
    contract: Contract;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE_VARIANT: Record<ContractStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
    draft: 'secondary',
    active: 'default',
    completed: 'outline',
    cancelled: 'destructive',
};

const STATUS_LABEL: Record<ContractStatus, string> = {
    draft: 'Draft',
    active: 'Aktif',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="mt-0.5 text-sm font-medium">{value}</div>
            </div>
        </div>
    );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ContractShow({ contract }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kontrak', href: '#' },
        { title: contract.contract_number, href: route('admin.contracts.show', contract.id) },
    ];

    const [pendingStatus, setPendingStatus] = useState<ContractStatus | null>(null);
    const [processing, setProcessing] = useState(false);

    // ── Allowed transitions based on current status
    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
        draft: ['active', 'cancelled'],
        active: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
    };
    const transitions = allowedTransitions[contract.status];
    const isTerminal = transitions.length === 0;

    // ── Status transition handler
    const handleUpdateStatus = (newStatus: ContractStatus) => {
        setProcessing(true);
        router.post(
            route('admin.contracts.update-status', contract.id),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status kontrak berhasil diubah ke "${STATUS_LABEL[newStatus]}".`);
                },
                onError: () => {
                    toast.error('Gagal mengubah status kontrak.');
                },
                onFinish: () => {
                    setProcessing(false);
                    setPendingStatus(null);
                },
            },
        );
    };

    const confirmLabel: Record<ContractStatus, string> = {
        draft: '',
        active: 'Aktifkan',
        completed: 'Tandai Selesai',
        cancelled: 'Batalkan Kontrak',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const confirmVariant: Record<ContractStatus, string> = {
        active: '',
        completed: '',
        cancelled: 'destructive',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // ── Related entities from Proposal
    const relatedUniversity = contract.university;
    const relatedProposal = contract.proposal;
    const relatedResearcher = contract.proposal?.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kontrak ${contract.contract_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">

                    {/* ── Back button ─────────────────────────────────────── */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" className="h-auto justify-start gap-2 p-0" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <Hash className="h-3.5 w-3.5" />
                                <span className="font-mono">{contract.contract_number}</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{contract.title}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Dibuat {formatDateTime(contract.created_at)}
                                {contract.creator && ` oleh ${contract.creator.name}`}
                            </p>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0">
                            <StatusBadge status={contract.status} className="px-3 py-1 text-sm" />
                        </div>
                    </div>

                    {/* ── Status Actions ───────────────────────────────────── */}
                    {!isTerminal && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {transitions.includes('active') && (
                                <Button
                                    id="btn-activate-contract"
                                    className="gap-2"
                                    disabled={processing}
                                    onClick={() => setPendingStatus('active')}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Aktifkan Kontrak
                                </Button>
                            )}
                            {transitions.includes('completed') && (
                                <Button
                                    id="btn-complete-contract"
                                    variant="outline"
                                    className="gap-2"
                                    disabled={processing}
                                    onClick={() => setPendingStatus('completed')}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Tandai Selesai
                                </Button>
                            )}
                            {transitions.includes('cancelled') && (
                                <Button
                                    id="btn-cancel-contract"
                                    variant="destructive"
                                    className="gap-2"
                                    disabled={processing}
                                    onClick={() => setPendingStatus('cancelled')}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Batalkan Kontrak
                                </Button>
                            )}
                        </div>
                    )}

                    {/* ── Terminal state info banner ───────────────────────── */}
                    {isTerminal && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                Kontrak ini berstatus <strong>{STATUS_LABEL[contract.status]}</strong> dan tidak dapat diubah lagi.
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* ── LEFT column (2/3) ────────────────────────────── */}
                        <div className="space-y-6 lg:col-span-2">

                            {/* Contract detail card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Detail Kontrak
                                    </CardTitle>
                                    <CardDescription>Informasi dasar kontrak penelitian</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <DetailRow
                                            icon={CalendarDays}
                                            label="Tanggal Mulai"
                                            value={formatDate(contract.start_date)}
                                        />
                                        <DetailRow
                                            icon={CalendarDays}
                                            label="Tanggal Berakhir"
                                            value={formatDate(contract.end_date)}
                                        />
                                    </div>

                                    {(contract.start_date && contract.end_date) && (
                                        <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                            <p className="text-xs text-muted-foreground">Periode Kontrak</p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                                            </p>
                                        </div>
                                    )}

                                    {contract.description && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Syarat & Ketentuan / Deskripsi
                                                </p>
                                                <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {contract.description}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {contract.notes && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Catatan
                                                </p>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {contract.notes}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {!contract.description && !contract.notes && (
                                        <p className="text-sm text-muted-foreground italic">
                                            Belum ada syarat, ketentuan, atau catatan yang ditambahkan.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Proposal card */}
                            {contract.proposal && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4" />
                                            Proposal Penelitian Terkait
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <DetailRow
                                            icon={ClipboardList}
                                            label="Judul Proposal"
                                            value={contract.proposal.judul}
                                        />
                                        {contract.proposal.deskripsi && (
                                            <DetailRow
                                                icon={FileText}
                                                label="Deskripsi"
                                                value={contract.proposal.deskripsi}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* ── RIGHT column (1/3) ───────────────────────────── */}
                        <div className="space-y-6">

                            {/* Parties card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building2 className="h-4 w-4" />
                                        Pihak Terkait
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {relatedUniversity ? (
                                        <DetailRow
                                            icon={Building2}
                                            label="Universitas"
                                            value={relatedUniversity.short_name ?? relatedUniversity.name}
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            Belum ada universitas terkait.
                                        </p>
                                    )}

                                    {relatedResearcher && (
                                        <DetailRow
                                            icon={User2}
                                            label="Peneliti / Dosen"
                                            value={relatedResearcher.name}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Audit trail card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User2 className="h-4 w-4" />
                                        Riwayat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <DetailRow
                                        icon={User2}
                                        label="Dibuat oleh"
                                        value={
                                            <span>
                                                {contract.creator?.name ?? '—'}
                                                <br />
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {formatDateTime(contract.created_at)}
                                                </span>
                                            </span>
                                        }
                                    />
                                    {contract.updater && (
                                        <DetailRow
                                            icon={User2}
                                            label="Terakhir diubah oleh"
                                            value={
                                                <span>
                                                    {contract.updater.name}
                                                    <br />
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        {formatDateTime(contract.updated_at)}
                                                    </span>
                                                </span>
                                            }
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Status Transition Confirmation Dialog ──────────────────── */}
            <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => { if (!open) setPendingStatus(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingStatus && confirmLabel[pendingStatus]}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingStatus === 'active' && (
                                <>
                                    Kontrak <strong>{contract.contract_number}</strong> akan diubah statusnya menjadi{' '}
                                    <strong>Aktif</strong>. Pastikan semua data sudah benar sebelum mengaktifkan.
                                </>
                            )}
                            {pendingStatus === 'completed' && (
                                <>
                                    Kontrak <strong>{contract.contract_number}</strong> akan ditandai sebagai{' '}
                                    <strong>Selesai</strong>. Tindakan ini tidak dapat dibatalkan.
                                </>
                            )}
                            {pendingStatus === 'cancelled' && (
                                <>
                                    Kontrak <strong>{contract.contract_number}</strong> akan{' '}
                                    <strong>dibatalkan</strong>. Tindakan ini tidak dapat dibatalkan.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            id="btn-confirm-status"
                            disabled={processing}
                            className={
                                pendingStatus === 'cancelled'
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : undefined
                            }
                            onClick={() => pendingStatus && handleUpdateStatus(pendingStatus)}
                        >
                            {processing ? 'Memproses...' : pendingStatus && confirmLabel[pendingStatus]}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
