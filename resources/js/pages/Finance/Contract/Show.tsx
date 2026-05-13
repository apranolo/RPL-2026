/**
 * Finance - Contract Detail Page
 *
 * @description View detail draft kontrak penelitian beserta tombol ubah status.
 * @route GET /finance/contracts/{contract}
 */
import { ContractStatusBadge } from '@/components/StatusBadge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Ban,
    Building2,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    Hash,
    RotateCcw,
    User,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ContractStatus = 'draft' | 'aktif' | 'selesai' | 'batal';

interface University {
    id: number;
    name: string;
    short_name?: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    university: University;
}

interface Pembinaan {
    id: number;
    name: string;
    category: 'akreditasi' | 'indeksasi';
}

interface Researcher {
    id: number;
    name: string;
    email: string;
    position?: string;
    university?: University;
}

interface Registration {
    id: number;
    journal: Journal;
    user: Researcher;
    pembinaan: Pembinaan;
    registered_at: string;
}

interface AuditUser {
    id: number;
    name: string;
}

interface Contract {
    id: number;
    registration_id: number;
    contract_number: string;
    nilai_kontrak: string | null;
    nilai_kontrak_formatted: string;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
    catatan: string | null;
    status: ContractStatus;
    status_label: string;
    generated_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    registration: Registration;
    generatedBy?: AuditUser;
    updatedBy?: AuditUser;
}

interface Props {
    contract: Contract;
    breadcrumbs: BreadcrumbItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Allowed status transitions per current status
const TRANSITIONS: Record<ContractStatus, { value: ContractStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[]> = {
    draft: [
        { value: 'aktif', label: 'Aktifkan Kontrak', variant: 'default' },
        { value: 'batal', label: 'Batalkan Kontrak', variant: 'destructive' },
    ],
    aktif: [
        { value: 'selesai', label: 'Tandai Selesai', variant: 'default' },
        { value: 'draft', label: 'Kembalikan ke Draft', variant: 'outline' },
        { value: 'batal', label: 'Batalkan Kontrak', variant: 'destructive' },
    ],
    selesai: [],
    batal: [],
};

const TRANSITION_DESCRIPTIONS: Partial<Record<ContractStatus, string>> = {
    aktif: 'Kontrak akan diaktifkan dan peneliti akan dapat memulai kegiatan penelitian.',
    selesai: 'Kontrak akan ditandai sebagai selesai. Tindakan ini tidak dapat dibatalkan.',
    draft: 'Kontrak akan dikembalikan ke status draft untuk perbaikan.',
    batal: 'Kontrak akan dibatalkan. Tindakan ini tidak dapat dibatalkan.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Info Row Component
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-0.5 font-medium text-foreground">{value || '-'}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ContractShow({ contract, breadcrumbs }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [catatan, setCatatan] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const transitions = TRANSITIONS[contract.status] ?? [];
    const isTerminal = contract.status === 'selesai' || contract.status === 'batal';

    const handleUpdateStatus = (newStatus: ContractStatus) => {
        setSubmitting(true);
        router.patch(
            route('finance.contracts.update-status', contract.id),
            { status: newStatus, catatan: catatan || undefined },
            {
                onFinish: () => {
                    setSubmitting(false);
                    setCatatan('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kontrak ${contract.contract_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* ── Flash Messages ─────────────────────────────────────── */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <Ban className="h-4 w-4 shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2 pl-0 text-muted-foreground hover:text-foreground"
                            onClick={() => router.visit(route('finance.contracts.index'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Kontrak
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">{contract.contract_number}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Dibuat {formatDateTime(contract.created_at)}
                            {contract.generatedBy && ` · oleh ${contract.generatedBy.name}`}
                        </p>
                    </div>
                    <ContractStatusBadge status={contract.status} className="self-start text-sm sm:self-auto" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left Column: Contract & Researcher Info ─────────── */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Contract Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <CardTitle className="text-lg">Informasi Kontrak</CardTitle>
                                </div>
                                <CardDescription>Detail dokumen kontrak penelitian</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border">
                                <InfoRow
                                    icon={Hash}
                                    label="Nomor Kontrak"
                                    value={
                                        <span className="font-mono text-base font-semibold tracking-wide text-blue-700 dark:text-blue-400">
                                            {contract.contract_number}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    icon={ClipboardList}
                                    label="Program Pembinaan"
                                    value={
                                        <span>
                                            {contract.registration.pembinaan.name}
                                            <span className="ml-2 text-xs font-normal capitalize text-muted-foreground">
                                                ({contract.registration.pembinaan.category})
                                            </span>
                                        </span>
                                    }
                                />
                                <InfoRow
                                    icon={Wallet}
                                    label="Nilai Kontrak"
                                    value={
                                        <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                                            {contract.nilai_kontrak_formatted}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Tanggal Mulai"
                                    value={formatDate(contract.tanggal_mulai)}
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Tanggal Selesai"
                                    value={formatDate(contract.tanggal_selesai)}
                                />
                                {contract.catatan && (
                                    <InfoRow
                                        icon={FileText}
                                        label="Catatan"
                                        value={
                                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                                {contract.catatan}
                                            </p>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Researcher & Journal Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <CardTitle className="text-lg">Peneliti &amp; Jurnal</CardTitle>
                                </div>
                                <CardDescription>Informasi peneliti dan jurnal terkait registrasi</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border">
                                <InfoRow
                                    icon={User}
                                    label="Nama Peneliti"
                                    value={contract.registration.user.name}
                                />
                                <InfoRow
                                    icon={FileText}
                                    label="Email Peneliti"
                                    value={
                                        <a
                                            href={`mailto:${contract.registration.user.email}`}
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {contract.registration.user.email}
                                        </a>
                                    }
                                />
                                {contract.registration.user.position && (
                                    <InfoRow
                                        icon={BadgeCheck}
                                        label="Jabatan"
                                        value={contract.registration.user.position}
                                    />
                                )}
                                <Separator className="my-1" />
                                <InfoRow
                                    icon={ClipboardList}
                                    label="Judul Jurnal"
                                    value={contract.registration.journal.title}
                                />
                                <InfoRow
                                    icon={Hash}
                                    label="ISSN"
                                    value={
                                        <span className="font-mono">{contract.registration.journal.issn}</span>
                                    }
                                />
                                <InfoRow
                                    icon={Building2}
                                    label="Perguruan Tinggi"
                                    value={contract.registration.journal.university.name}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Tanggal Registrasi"
                                    value={formatDate(contract.registration.registered_at)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Right Column: Status Panel ──────────────────────── */}
                    <div className="flex flex-col gap-6">
                        {/* Current Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Kontrak</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                                    <ContractStatusBadge status={contract.status} className="text-sm" />
                                    <span className="text-sm text-muted-foreground">{contract.status_label}</span>
                                </div>

                                {/* Audit info */}
                                {contract.updatedBy && (
                                    <p className="text-xs text-muted-foreground">
                                        Terakhir diperbarui oleh{' '}
                                        <span className="font-medium text-foreground">{contract.updatedBy.name}</span>
                                        {' · '}
                                        {formatDateTime(contract.updated_at)}
                                    </p>
                                )}

                                {isTerminal && (
                                    <div className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center text-sm text-muted-foreground">
                                        Kontrak ini sudah dalam status akhir dan tidak dapat diubah kembali.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Update Actions */}
                        {!isTerminal && transitions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Ubah Status</CardTitle>
                                    <CardDescription className="text-xs">
                                        Tambahkan catatan opsional sebelum mengubah status kontrak.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Optional notes input */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="catatan-status" className="text-xs">
                                            Catatan (opsional)
                                        </Label>
                                        <Textarea
                                            id="catatan-status"
                                            placeholder="Tambahkan catatan perubahan status..."
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            rows={3}
                                            className="resize-none text-sm"
                                        />
                                    </div>

                                    {/* Transition buttons */}
                                    <div className="flex flex-col gap-2">
                                        {transitions.map((t) => (
                                            <AlertDialog key={t.value}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant={t.variant}
                                                        size="sm"
                                                        disabled={submitting}
                                                        className="w-full justify-start"
                                                    >
                                                        {t.value === 'aktif' && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                                        {t.value === 'selesai' && <BadgeCheck className="mr-2 h-4 w-4" />}
                                                        {t.value === 'draft' && <RotateCcw className="mr-2 h-4 w-4" />}
                                                        {t.value === 'batal' && <Ban className="mr-2 h-4 w-4" />}
                                                        {t.label}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Konfirmasi: {t.label}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {TRANSITION_DESCRIPTIONS[t.value] ??
                                                                `Apakah Anda yakin ingin mengubah status kontrak menjadi "${t.label}"?`}
                                                            {catatan && (
                                                                <span className="mt-2 block rounded-md bg-muted/70 px-3 py-2 text-xs text-foreground">
                                                                    <strong>Catatan:</strong> {catatan}
                                                                </span>
                                                            )}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleUpdateStatus(t.value)}
                                                            className={
                                                                t.variant === 'destructive'
                                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                                    : ''
                                                            }
                                                        >
                                                            {submitting ? 'Memproses...' : 'Ya, Lanjutkan'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Info Card */}
                        <Card className="bg-muted/30">
                            <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
                                <p className="font-semibold text-foreground">Alur Status Kontrak</p>
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2">
                                        <ContractStatusBadge status="draft" className="text-xs" />
                                        <span>→ Kontrak baru digenerate</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ContractStatusBadge status="aktif" className="text-xs" />
                                        <span>→ Kontrak resmi berlaku</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ContractStatusBadge status="selesai" className="text-xs" />
                                        <span>→ Penelitian selesai</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ContractStatusBadge status="batal" className="text-xs" />
                                        <span>→ Kontrak dibatalkan</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
