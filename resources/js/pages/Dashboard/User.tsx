import StatsCard from '@/components/StatsCard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ClipboardList,
    FileText,
    InboxIcon,
    Percent,
    XCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProposalStats {
    total: number;
    masuk: number;
    lolos: number;
    gagal: number;
    success_rate: number;
}

interface JournalsByStatus {
    pending: number;
    approved: number;
    rejected: number;
}

interface DashboardStats {
    total_journals: number;
    total_assessments: number;
    average_score: number;
    journals_by_status?: JournalsByStatus;
}

interface UserDashboardProps extends PageProps {
    stats: DashboardStats;
    proposal_stats: ProposalStats;
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper — circular progress ring
// ─────────────────────────────────────────────────────────────────────────────

function SuccessRing({ rate }: { rate: number }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const filled = (rate / 100) * circumference;
    const color =
        rate >= 75
            ? 'text-emerald-500'
            : rate >= 40
              ? 'text-amber-500'
              : 'text-red-500';

    return (
        <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
                {/* Track */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                />
                {/* Progress */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - filled}
                    className={`${color} transition-all duration-700 ease-out`}
                />
            </svg>
            <span className={`absolute text-lg font-bold ${color}`}>{rate}%</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function UserDashboard({ stats, proposal_stats }: UserDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const journalsByStatus = stats.journals_by_status ?? { pending: 0, approved: 0, rejected: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Dosen" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">

                {/* ── Welcome banner ─────────────────────────────────────── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Selamat datang,{' '}
                            <span className="text-primary">{user.name}</span> 👋
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Berikut ringkasan aktivitas dan proposal pembinaan jurnal Anda.
                        </p>
                    </div>
                    <Link
                        href={route('user.journals.index')}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted sm:mt-0 dark:bg-neutral-950"
                    >
                        <BookOpen className="h-4 w-4" />
                        Jurnal Saya
                    </Link>
                </div>

                {/* ── Section: Ringkasan Jurnal ───────────────────────────── */}
                <section aria-labelledby="jurnal-section-title">
                    <h2
                        id="jurnal-section-title"
                        className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                        Ringkasan Jurnal
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Jurnal */}
                        <StatsCard
                            title="Total Jurnal"
                            value={stats.total_journals}
                            description="Jurnal yang Anda kelola"
                            icon={BookOpen}
                            variant="blue"
                            id="stat-total-jurnal"
                        />

                        {/* Pending */}
                        <StatsCard
                            title="Menunggu Persetujuan"
                            value={journalsByStatus.pending}
                            description="Jurnal sedang diproses"
                            icon={InboxIcon}
                            variant="amber"
                            id="stat-jurnal-pending"
                        />

                        {/* Disetujui */}
                        <StatsCard
                            title="Disetujui"
                            value={journalsByStatus.approved}
                            description="Jurnal telah disetujui"
                            icon={CheckCircle}
                            variant="green"
                            id="stat-jurnal-approved"
                        />

                        {/* Ditolak */}
                        <StatsCard
                            title="Ditolak"
                            value={journalsByStatus.rejected}
                            description="Jurnal tidak disetujui"
                            icon={XCircle}
                            variant="red"
                            id="stat-jurnal-rejected"
                        />
                    </div>
                </section>

                {/* ── Section: Asesmen ────────────────────────────────────── */}
                <section aria-labelledby="asesmen-section-title">
                    <h2
                        id="asesmen-section-title"
                        className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                        Asesmen
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <StatsCard
                            title="Total Asesmen"
                            value={stats.total_assessments}
                            description="Seluruh asesmen yang pernah diajukan"
                            icon={ClipboardList}
                            variant="purple"
                            id="stat-total-asesmen"
                        />

                        <StatsCard
                            title="Rata-rata Skor"
                            value={
                                stats.average_score !== null
                                    ? `${Number(stats.average_score).toFixed(1)}`
                                    : '—'
                            }
                            description="Dari seluruh asesmen yang dinilai"
                            icon={Percent}
                            variant="cyan"
                            progress={
                                stats.average_score
                                    ? Math.min(100, Number(stats.average_score))
                                    : 0
                            }
                            progressLabel="Progres skor"
                            id="stat-avg-score"
                        />
                    </div>
                </section>

                {/* ── Section: Proposal Pembinaan ─────────────────────────── */}
                <section aria-labelledby="proposal-section-title">
                    <h2
                        id="proposal-section-title"
                        className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                        Proposal Pembinaan
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Proposal */}
                        <StatsCard
                            title="Total Proposal"
                            value={proposal_stats.total}
                            description="Semua proposal yang pernah diajukan"
                            icon={FileText}
                            variant="default"
                            id="stat-proposal-total"
                        />

                        {/* Masuk (Pending) */}
                        <StatsCard
                            title="Proposal Masuk"
                            value={proposal_stats.masuk}
                            description="Sedang menunggu keputusan"
                            icon={InboxIcon}
                            variant="amber"
                            id="stat-proposal-masuk"
                        />

                        {/* Lolos */}
                        <StatsCard
                            title="Proposal Lolos"
                            value={proposal_stats.lolos}
                            description="Disetujui oleh Admin"
                            icon={CheckCircle}
                            variant="green"
                            id="stat-proposal-lolos"
                        />

                        {/* Gagal */}
                        <StatsCard
                            title="Proposal Gagal"
                            value={proposal_stats.gagal}
                            description="Ditolak atau tidak lolos seleksi"
                            icon={XCircle}
                            variant="red"
                            id="stat-proposal-gagal"
                        />
                    </div>
                </section>

                {/* ── Success Rate Card ───────────────────────────────────── */}
                {(proposal_stats.lolos > 0 || proposal_stats.gagal > 0) && (
                    <section aria-labelledby="success-rate-title">
                        <h2
                            id="success-rate-title"
                            className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                        >
                            Tingkat Keberhasilan
                        </h2>

                        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                {/* Ring chart */}
                                <div className="flex-shrink-0">
                                    <SuccessRing rate={proposal_stats.success_rate} />
                                </div>

                                {/* Detail */}
                                <div className="flex-1">
                                    <p className="text-base font-semibold">
                                        Tingkat Keberhasilan Proposal
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Persentase proposal yang lolos dari total proposal yang
                                        telah mendapat keputusan (lolos + gagal).
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-6">
                                        {/* Lolos */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Lolos:{' '}
                                                <strong className="text-foreground">
                                                    {proposal_stats.lolos}
                                                </strong>
                                            </span>
                                        </div>
                                        {/* Gagal */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Gagal:{' '}
                                                <strong className="text-foreground">
                                                    {proposal_stats.gagal}
                                                </strong>
                                            </span>
                                        </div>
                                        {/* Pending */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Menunggu:{' '}
                                                <strong className="text-foreground">
                                                    {proposal_stats.masuk}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Keberhasilan</span>
                                            <span className="font-semibold">
                                                {proposal_stats.success_rate}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={[
                                                    'h-full rounded-full transition-all duration-700 ease-out',
                                                    proposal_stats.success_rate >= 75
                                                        ? 'bg-emerald-500'
                                                        : proposal_stats.success_rate >= 40
                                                          ? 'bg-amber-500'
                                                          : 'bg-red-500',
                                                ].join(' ')}
                                                style={{
                                                    width: `${proposal_stats.success_rate}%`,
                                                }}
                                                role="progressbar"
                                                aria-valuenow={proposal_stats.success_rate}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Empty state ketika belum ada jurnal ────────────────── */}
                {stats.total_journals === 0 && (
                    <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 bg-white p-8 text-center dark:border-sidebar-border dark:bg-neutral-950">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Belum Ada Jurnal</h3>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            Anda belum mengelola jurnal apapun. Mulai dengan menambahkan jurnal
                            pertama Anda.
                        </p>
                        <Link
                            href={route('user.journals.create')}
                            id="btn-tambah-jurnal"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        >
                            <BookOpen className="h-4 w-4" />
                            Tambah Jurnal
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
