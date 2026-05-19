/**
 * Contract Detail / Show Page
 *
 * @description View detail draft kontrak penelitian — includes contract
 *              information, journal metadata, status history, and action
 *              buttons to transition the contract status.
 * @route GET /finance/contracts/{id}
 */
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    CircleX,
    ClipboardList,
    FileText,
    Hash,
    User,
    Wallet,
    Zap,
} from 'lucide-react';
import { FormEvent } from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface University {
    id: number;
    name: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string | null;
    url?: string | null;
    university?: University | null;
}

interface UserProfile {
    id: number;
    name: string;
    email?: string | null;
}

interface Contract {
    id: number;
    contract_number: string;
    title: string;
    description: string | null;
    value: string | number | null;
    start_date: string;
    end_date: string;
    status: 'draft' | 'aktif' | 'selesai' | 'batal';
    status_label: string;
    status_color: string;
    generated_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    journal: Journal;
    user: UserProfile;
    generator?: UserProfile | null;
}

interface Props {
    contract: Contract;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatCurrency(value: string | number | null): string {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/*
|--------------------------------------------------------------------------
| Status Update Form
|--------------------------------------------------------------------------
*/

interface StatusUpdateFormProps {
    contract: Contract;
}

function StatusUpdateForm({ contract }: StatusUpdateFormProps) {
    const { data, setData, patch, processing, errors, transform } = useForm<{
        status: string;
        notes: string;
        error?: string;
    }>({
        status: '',
        notes: contract.notes ?? '',
    });

    const allowedTransitions: Record<string, { value: string; label: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' }[]> = {
        draft: [
            { value: 'aktif', label: 'Aktifkan Kontrak', icon: Zap, variant: 'default' },
        ],
        aktif: [
            { value: 'selesai', label: 'Tandai Selesai', icon: CheckCircle2, variant: 'default' },
            { value: 'batal', label: 'Batalkan Kontrak', icon: CircleX, variant: 'destructive' },
        ],
    };

    const transitions = allowedTransitions[contract.status] ?? [];

    if (transitions.length === 0) return null;

    const handleSubmit = (newStatus: string) => (e: FormEvent) => {
        e.preventDefault();
        if (!confirm(`Yakin ingin mengubah status kontrak menjadi "${newStatus}"?`)) return;
        transform((data) => ({
            ...data,
            status: newStatus,
        }));
        patch(route('finance.contracts.update-status', contract.id));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Ubah Status Kontrak</CardTitle>
                <CardDescription>Pilih tindakan yang sesuai untuk mengubah status kontrak ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {errors.status && (
                    <p className="text-sm text-destructive">{errors.status}</p>
                )}
                {errors.error && (
                    <p className="text-sm text-destructive">{errors.error}</p>
                )}

                <div className="space-y-2">
                    <label htmlFor="status-notes" className="block text-sm font-medium">
                        Catatan (opsional)
                    </label>
                    <textarea
                        id="status-notes"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Tambahkan catatan perubahan status..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {transitions.map(({ value, label, icon: Icon, variant }) => (
                        <form key={value} onSubmit={handleSubmit(value)}>
                            <Button
                                id={`btn-status-${value}`}
                                type="submit"
                                variant={variant}
                                disabled={processing}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {processing ? 'Menyimpan...' : label}
                            </Button>
                        </form>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/*
|--------------------------------------------------------------------------
| Info Row helper
|--------------------------------------------------------------------------
*/

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Page Component
|--------------------------------------------------------------------------
*/

export default function ContractShow({ contract }: Props) {
    const handleDelete = () => {
        if (!confirm('Hapus draft kontrak ini? Tindakan ini tidak dapat dibatalkan.')) return;
        router.delete(route('finance.contracts.destroy', contract.id));
    };

    return (
        <AppLayout>
            <Head title={`Kontrak ${contract.contract_number}`} />

            <div className="mx-auto max-w-5xl space-y-6">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Link href={route('finance.contracts.index')}>
                            <Button variant="ghost" size="sm" className="mb-3">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Kontrak
                            </Button>
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Detail Kontrak Penelitian
                            </h1>
                            <StatusBadge status={contract.status} size="md" />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Nomor Kontrak: <span className="font-mono font-medium">{contract.contract_number}</span>
                        </p>
                    </div>

                    {/* Delete draft only */}
                    {contract.status === 'draft' && (
                        <Button
                            id="btn-delete-contract"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <CircleX className="mr-1.5 h-4 w-4" />
                            Hapus Draft
                        </Button>
                    )}
                </div>

                {/* ── Main Grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left column — primary details */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Contract Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    Informasi Kontrak
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Judul Kontrak
                                    </p>
                                    <p className="mt-1 text-base font-semibold">{contract.title}</p>
                                </div>

                                {contract.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Deskripsi
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                                                {contract.description}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InfoRow
                                        icon={Hash}
                                        label="Nomor Kontrak"
                                        value={<span className="font-mono">{contract.contract_number}</span>}
                                    />
                                    <InfoRow
                                        icon={Wallet}
                                        label="Nilai Kontrak"
                                        value={formatCurrency(contract.value)}
                                    />
                                    <InfoRow
                                        icon={Calendar}
                                        label="Tanggal Mulai"
                                        value={formatDate(contract.start_date)}
                                    />
                                    <InfoRow
                                        icon={Calendar}
                                        label="Tanggal Berakhir"
                                        value={formatDate(contract.end_date)}
                                    />
                                </div>

                                {contract.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Catatan
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                                {contract.notes}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Journal Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Jurnal Terkait
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Nama Jurnal
                                    </p>
                                    <p className="mt-1 text-base font-semibold">{contract.journal.title}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <InfoRow
                                        icon={Hash}
                                        label="ISSN"
                                        value={contract.journal.issn || '—'}
                                    />
                                    {contract.journal.e_issn && (
                                        <InfoRow
                                            icon={Hash}
                                            label="e-ISSN"
                                            value={contract.journal.e_issn}
                                        />
                                    )}
                                    {contract.journal.university && (
                                        <InfoRow
                                            icon={Building2}
                                            label="Universitas"
                                            value={contract.journal.university.name}
                                        />
                                    )}
                                    {contract.journal.url && (
                                        <div className="flex items-start gap-3">
                                            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">URL Jurnal</p>
                                                <a
                                                    href={contract.journal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-0.5 truncate text-sm font-semibold text-primary hover:underline"
                                                >
                                                    Kunjungi Jurnal
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column — status & people */}
                    <div className="space-y-6">

                        {/* Status Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Kontrak</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status Saat Ini</span>
                                    <StatusBadge status={contract.status} size="sm" />
                                </div>
                                <Separator />

                                {/* Status badges grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(['draft', 'aktif', 'selesai', 'batal'] as const).map((s) => (
                                        <div
                                            key={s}
                                            className={`flex items-center justify-center rounded-lg border p-2 transition-opacity ${
                                                contract.status === s ? 'opacity-100' : 'opacity-30'
                                            }`}
                                        >
                                            <StatusBadge status={s} size="sm" />
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dibuat</span>
                                        <span className="font-medium">{formatDate(contract.created_at)}</span>
                                    </div>
                                    {contract.generated_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Digenerate</span>
                                            <span className="font-medium">{formatDate(contract.generated_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* People Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Pihak Terkait</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <InfoRow
                                    icon={User}
                                    label="Pengelola Jurnal"
                                    value={contract.user.name}
                                />
                                {contract.generator && (
                                    <>
                                        <Separator />
                                        <InfoRow
                                            icon={User}
                                            label="Digenerate Oleh"
                                            value={contract.generator.name}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Badge legend */}
                        <Card className="border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground">Keterangan Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { status: 'draft' as const, desc: 'Kontrak belum difinalisasi' },
                                    { status: 'aktif' as const, desc: 'Kontrak sedang berjalan' },
                                    { status: 'selesai' as const, desc: 'Kontrak telah selesai' },
                                    { status: 'batal' as const, desc: 'Kontrak dibatalkan' },
                                ].map(({ status, desc }) => (
                                    <div key={status} className="flex items-center gap-2">
                                        <StatusBadge status={status} size="sm" />
                                        <span className="text-xs text-muted-foreground">{desc}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Status Action Form ─────────────────────────────── */}
                <StatusUpdateForm contract={contract} />

            </div>
        </AppLayout>
    );
}
