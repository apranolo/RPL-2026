import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    ExternalLink,
    GraduationCap,
    Timer,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface University {
    id: number;
    name: string;
    short_name?: string;
}

interface DashboardJournal {
    id: number;
    title: string;
    issn?: string;
    e_issn?: string;
    sinta_rank?: string;
    university?: University;
}

interface DashboardSubmission {
    id: number;
    title: string;
    journal?: DashboardJournal;
}

interface DashboardAssigner {
    id: number;
    name: string;
    email?: string;
}

interface DashboardAssignment {
    id: number;
    status: string;
    status_label: string;
    status_color: string;
    assigned_at: string;
    assigner?: DashboardAssigner;
    submission?: DashboardSubmission;
}

interface DashboardStats {
    total_active: number;
    total_assigned: number;
    total_in_progress: number;
}

interface Props extends PageProps {
    assignments: DashboardAssignment[];
    stats: DashboardStats;
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reviewer Dashboard', href: '#' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Menghitung sisa hari hingga `endDate`.
 * Mengembalikan null jika tanggal tidak tersedia.
 */
function getDaysRemaining(endDate?: string | null): number | null {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    // Bulatkan ke hari
    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Badge status penugasan */
function StatusBadge({ status, status_label }: { status: string; status_label?: string }) {
    const config: Record<string, { label: string; className: string }> = {
        assigned: {
            label: 'Menunggu Dimulai',
            className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        },
        in_progress: {
            label: 'Sedang Direview',
            className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        },
        Accepted: {
            label: 'Diterima',
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        },
        Declined: {
            label: 'Ditolak',
            className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        },
        completed: {
            label: 'Selesai',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        },
    };

    const item = config[status] ?? {
        label: status_label ?? status,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${item.className}`}>
            {item.label}
        </span>
    );
}

/** Countdown due-date dengan warna dinamis */
function DueDateCountdown({ assessmentEnd }: { assessmentEnd?: string | null }) {
    const days = getDaysRemaining(assessmentEnd);

    if (days === null) {
        return (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Tidak ada batas waktu
            </span>
        );
    }

    if (days < 0) {
        return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Tenggat terlewati ({Math.abs(days)} hari lalu)
            </span>
        );
    }

    if (days === 0) {
        return (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <Timer className="h-3.5 w-3.5 animate-pulse" />
                Tenggat hari ini!
            </span>
        );
    }

    const colorClass =
        days <= 3 ? 'text-red-600 dark:text-red-400' : days <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';

    return (
        <span className={`flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
            <Timer className="h-3.5 w-3.5" />
            {days} hari tersisa (hingga {formatDate(assessmentEnd)})
        </span>
    );
}

/** Kartu ringkasan statistik */
function StatCard({ label, value, icon, colorClass }: { label: string; value: number; icon: React.ReactNode; colorClass: string }) {
    return (
        <Card className="border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
            <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>{icon}</div>
                <div>
                    <p className="text-2xl leading-none font-bold tabular-nums">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

/** Kartu satu penugasan */
function AssignmentCard({ assignment }: { assignment: DashboardAssignment }) {
    const submission = assignment.submission;
    const journal = submission?.journal;

    // As per double-blind rules, we shouldn't show author info here either.
    // For now, no specific due date is available on submission level in this view, passing null.
    const daysRemaining = getDaysRemaining(null);

    // Urgency border indicator
    const urgencyBorder =
        daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0
            ? 'border-l-4 border-l-red-500'
            : daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0
              ? 'border-l-4 border-l-amber-500'
              : '';

    return (
        <Card
            className={`overflow-hidden border border-sidebar-border/70 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-sidebar-border dark:bg-neutral-950 ${urgencyBorder}`}
        >
            <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Journal info */}
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {submission?.title ?? <span className="text-muted-foreground italic">Naskah tidak tersedia</span>}
                            </p>
                            {journal?.title && <p className="mt-0.5 text-xs text-muted-foreground">Jurnal: {journal.title}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                {journal?.university?.name && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Building2 className="h-3 w-3" />
                                        {journal.university.short_name ?? journal.university.name}
                                    </span>
                                )}
                                {journal?.sinta_rank && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <GraduationCap className="h-3 w-3" />
                                        SINTA {journal.sinta_rank}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Status + actions */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                        <StatusBadge status={assignment.status} status_label={assignment.status_label} />
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Ditugaskan {formatDate(assignment.assigned_at)}
                        </span>
                    </div>
                </div>

                {/* Due date countdown */}
                <div className="mt-4 flex flex-col gap-2 border-t border-sidebar-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                    <DueDateCountdown assessmentEnd={null} />

                    <div className="flex gap-2">
                        {/* Tombol navigasi ke halaman undangan */}
                        <Button
                            id={`btn-view-invitation-${assignment.id}`}
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => router.visit(`/review-assignment/${assignment.id}`)}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Lihat Detail
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/** Live clock untuk header */
function LiveClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <span className="text-sm text-muted-foreground tabular-nums">
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            {' · '}
            {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

/**
 * Halaman dashboard reviewer menampilkan daftar tugas review aktif
 * beserta status dan countdown due date penilaian.
 */
export default function Dashboard({ assignments, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6">
                {/* ── Page Header ── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard Reviewer</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Kelola dan pantau tugas review jurnal aktif Anda.</p>
                    </div>
                    <LiveClock />
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total Tugas Aktif"
                        value={stats.total_active}
                        icon={<TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
                        colorClass="bg-violet-100 dark:bg-violet-900/20"
                    />
                    <StatCard
                        label="Menunggu Dimulai"
                        value={stats.total_assigned}
                        icon={<Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                        colorClass="bg-amber-100 dark:bg-amber-900/20"
                    />
                    <StatCard
                        label="Sedang Direview"
                        value={stats.total_in_progress}
                        icon={<ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                        colorClass="bg-blue-100 dark:bg-blue-900/20"
                    />
                </div>

                {/* ── Assignment List ── */}
                <Card className="border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
                    <CardHeader className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Daftar Tugas Review Aktif</CardTitle>
                                <CardDescription>
                                    {assignments.length > 0 ? `${assignments.length} tugas aktif ditemukan` : 'Tidak ada tugas aktif saat ini'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        {assignments.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Tidak ada tugas aktif</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Anda belum memiliki tugas review yang aktif saat ini. Tugas baru akan muncul di sini setelah Anda menerima
                                        undangan.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Assignment Cards */
                            <div className="flex flex-col gap-4">
                                {/* Legend */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3 w-0.5 rounded-full bg-red-500" />
                                        Tenggat ≤ 3 hari
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3 w-0.5 rounded-full bg-amber-500" />
                                        Tenggat ≤ 7 hari
                                    </span>
                                </div>

                                {assignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
