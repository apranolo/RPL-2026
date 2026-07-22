import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
    Mail,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn?: string;
    e_issn?: string;
    publisher?: string;
    sinta_rank?: string;
    sinta_rank_label?: string;
    university?: {
        id: number;
        name: string;
        short_name?: string;
    };
}

interface Submission {
    id: number;
    title: string;
    status: string;
    journal?: Journal;
}

interface Assigner {
    id: number;
    name: string;
    email?: string;
    position?: string;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string;
    reason?: string;
    submission?: Submission;
    assigner?: Assigner;
}

interface Props extends PageProps {
    assignment: Assignment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Undangan Review', href: '#' },
];

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
        assigned: {
            label: 'Menunggu Respons',
            icon: <Clock className="h-3.5 w-3.5" />,
            className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        },
        Accepted: {
            label: 'Diterima',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        },
        Declined: {
            label: 'Ditolak',
            icon: <XCircle className="h-3.5 w-3.5" />,
            className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        },
        in_progress: {
            label: 'Sedang Direview',
            icon: <ClipboardList className="h-3.5 w-3.5" />,
            className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        },
        completed: {
            label: 'Selesai',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        },
    };

    const config = statusConfig[status] ?? {
        label: status,
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
            {config.icon}
            {config.label}
        </span>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

export default function Invitation({ assignment }: Props) {
    const { auth } = usePage<PageProps>().props;

    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ reason?: string }>({});

    const isResponded = assignment.status === 'Accepted' || assignment.status === 'Declined';
    const isPending = assignment.status === 'assigned';

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleAccept = () => {
        setIsSubmitting(true);
        router.post(
            `/review-assignment/${assignment.id}/accept`,
            {},
            {
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDecline = () => {
        const newErrors: { reason?: string } = {};
        if (!declineReason.trim()) {
            newErrors.reason = 'Alasan penolakan wajib diisi.';
        } else if (declineReason.trim().length < 10) {
            newErrors.reason = 'Alasan penolakan minimal 10 karakter.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/review-assignment/${assignment.id}/decline`,
            { reason: declineReason },
            {
                onFinish: () => setIsSubmitting(false),
                onError: (err) => setErrors(err),
            },
        );
    };

    const submission = assignment.submission;
    const journal = submission?.journal;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Undangan Review" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Undangan Review Jurnal</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Anda menerima undangan untuk menjadi reviewer pada naskah berikut (Double-Blind Review).
                            </p>
                        </div>
                        <StatusBadge status={assignment.status} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Left */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Submission Info Card */}
                        <Card className="overflow-hidden border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
                            <CardHeader className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-lg leading-snug">
                                            {submission?.title ?? <span className="text-muted-foreground italic">Judul Naskah Tidak Tersedia</span>}
                                        </CardTitle>
                                        <CardDescription className="mt-1">Double-Blind Review: Identitas Penulis Disembunyikan</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Nama Jurnal" value={journal?.title} />
                                    <InfoRow
                                        icon={<Building2 className="h-4 w-4" />}
                                        label="Universitas / Penerbit"
                                        value={journal?.university?.name ?? journal?.publisher}
                                    />
                                    <InfoRow
                                        icon={<GraduationCap className="h-4 w-4" />}
                                        label="Peringkat SINTA"
                                        value={journal?.sinta_rank_label ?? (journal?.sinta_rank ? `SINTA ${journal.sinta_rank}` : undefined)}
                                    />
                                    <InfoRow
                                        icon={<FileText className="h-4 w-4" />}
                                        label="ISSN"
                                        value={
                                            journal?.issn ? `${journal.issn} ${journal.e_issn ? '(E-ISSN: ' + journal.e_issn + ')' : ''}` : undefined
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Already Responded State */}
                        {isResponded && (
                            <div
                                className={`rounded-xl border p-5 ${
                                    assignment.status === 'Accepted'
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {assignment.status === 'Accepted' ? (
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                                    )}
                                    <div>
                                        <p
                                            className={`font-semibold ${assignment.status === 'Accepted' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}
                                        >
                                            {assignment.status === 'Accepted'
                                                ? 'Anda telah menerima undangan ini'
                                                : 'Anda telah menolak undangan ini'}
                                        </p>
                                        {assignment.status === 'Declined' && assignment.reason && (
                                            <p className="mt-1.5 text-sm text-red-700 dark:text-red-400">
                                                <span className="font-medium">Alasan: </span>
                                                {assignment.reason}
                                            </p>
                                        )}
                                        {assignment.status === 'Accepted' && (
                                            <p className="mt-1.5 text-sm text-green-700 dark:text-green-400">
                                                Silakan lanjutkan ke halaman evaluasi untuk memulai proses review.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Right */}
                    <div className="flex flex-col gap-6">
                        {/* Assignment Meta Card */}
                        <Card className="border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
                            <CardHeader className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                                <CardTitle className="text-base">Informasi Penugasan</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="space-y-4">
                                    <InfoRow
                                        icon={<Clock className="h-4 w-4" />}
                                        label="Tanggal Ditugaskan"
                                        value={formatDate(assignment.assigned_at)}
                                    />
                                    {assignment.assigner && (
                                        <>
                                            <InfoRow
                                                icon={<UserCheck className="h-4 w-4" />}
                                                label="Ditugaskan Oleh"
                                                value={assignment.assigner.name}
                                            />
                                            {assignment.assigner.email && (
                                                <InfoRow
                                                    icon={<Mail className="h-4 w-4" />}
                                                    label="Email Penugasan"
                                                    value={assignment.assigner.email}
                                                />
                                            )}
                                        </>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <UserCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Reviewer</p>
                                            <p className="mt-0.5 text-sm font-medium text-foreground">{auth.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Card */}
                        {isPending && (
                            <Card className="border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
                                <CardHeader className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                                    <CardTitle className="text-base">Respons Undangan</CardTitle>
                                    <CardDescription>Harap merespons undangan ini untuk melanjutkan proses review.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    {!showDeclineForm ? (
                                        <div className="flex flex-col gap-3">
                                            {/* Accept Button */}
                                            <Button
                                                id="btn-accept-invitation"
                                                className="w-full gap-2 bg-green-600 text-white shadow-sm hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                                disabled={isSubmitting}
                                                onClick={handleAccept}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                {isSubmitting ? 'Memproses...' : 'Terima Undangan'}
                                            </Button>

                                            {/* Decline Button */}
                                            <Button
                                                id="btn-decline-invitation"
                                                variant="outline"
                                                className="w-full gap-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                                disabled={isSubmitting}
                                                onClick={() => setShowDeclineForm(true)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Tolak Undangan
                                            </Button>

                                            <p className="text-center text-xs text-muted-foreground">
                                                Dengan menerima, Anda setuju untuk melakukan review sesuai jadwal yang ditentukan.
                                            </p>
                                        </div>
                                    ) : (
                                        /* Decline Form */
                                        <div className="flex flex-col gap-4">
                                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
                                                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                                    Anda akan menolak undangan review ini
                                                </p>
                                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                                    Harap berikan alasan yang jelas agar tim admin dapat menindaklanjuti.
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="decline-reason" className="text-sm font-medium text-foreground">
                                                    Alasan Penolakan <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    id="decline-reason"
                                                    rows={4}
                                                    value={declineReason}
                                                    onChange={(e) => {
                                                        setDeclineReason(e.target.value);
                                                        if (errors.reason) setErrors({});
                                                    }}
                                                    placeholder="Contoh: Saya memiliki konflik jadwal pada periode ini dan tidak dapat menyelesaikan review tepat waktu..."
                                                    className={`w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:outline-none ${
                                                        errors.reason ? 'border-red-400 focus:ring-red-400/50' : 'border-input focus:ring-primary/30'
                                                    } transition-colors`}
                                                />
                                                {errors.reason && (
                                                    <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.reason}
                                                    </p>
                                                )}
                                                <p className="text-right text-xs text-muted-foreground">{declineReason.length} karakter (min. 10)</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    id="btn-cancel-decline"
                                                    variant="outline"
                                                    className="flex-1"
                                                    disabled={isSubmitting}
                                                    onClick={() => {
                                                        setShowDeclineForm(false);
                                                        setDeclineReason('');
                                                        setErrors({});
                                                    }}
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    id="btn-confirm-decline"
                                                    className="flex-1 gap-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                                    disabled={isSubmitting}
                                                    onClick={handleDecline}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Tolak'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Already Responded Action Card */}
                        {assignment.status === 'Accepted' && (
                            <Card className="border border-green-200 bg-green-50 shadow-sm dark:border-green-800 dark:bg-green-900/10">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-300">Undangan Diterima</p>
                                            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                                                Lanjutkan ke halaman evaluasi untuk memulai proses review naskah.
                                            </p>
                                        </div>
                                        <Button
                                            id="btn-go-to-evaluation"
                                            className="mt-1 w-full gap-2 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                            onClick={() => router.visit('/reviewer/evaluation')}
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Mulai Evaluasi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
