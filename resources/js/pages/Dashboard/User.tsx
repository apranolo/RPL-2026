/**
 * @fileoverview Dashboard/User.tsx — Personal research-proposal dashboard for the
 * "Peneliti / Dosen" role (Modul 6 – Dashboard dan Pelaporan).
 *
 * Displays KPI score cards and a visual success-rate ring sourced from the
 * `proposals` table (Modul 1 – Manajemen Proposal Penelitian) as specified in
 * the Sistem Penelitian Terintegrasi PRD for Kelas B.
 *
 * Data flow:
 *   DashboardController (PHP) → Inertia::render('Dashboard/User', [...])
 *     → this component via `stats` and `proposal_stats` page props.
 *
 * Metrics displayed per Modul 6 PRD spec:
 *   • Total Proposal   – all proposals ever submitted by this researcher
 *   • Diajukan         – submitted, awaiting administrative review (status=submitted)
 *   • Diterima         – passed administrative validation (status=administrasi_valid)
 *   • Ditolak          – rejected proposals (status=ditolak)
 *   • Draft            – proposals still in draft state (status=draft)
 *   • Total Pendanaan  – sum of approved funding (total_pendanaan_disetujui)
 *   • Tingkat Keberhasilan – success rate ring chart (lolos / decided × 100)
 *
 * @module pages/Dashboard/User
 * @author  RPL-2026 Kelas B
 * @since   2026-07-19
 */

import StatsCard from '@/components/StatsCard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle, ClipboardList, DraftingCompass, FileText, InboxIcon, Percent, XCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proposal riset statistics aggregated per-user from the `proposals` table.
 * Sourced from StatsService::getProposalSummaryForUser().
 */
interface ProposalStats {
    /** Total number of proposals ever submitted (all statuses). */
    total: number;
    /** Proposals currently awaiting administrative review (status = submitted). */
    masuk: number;
    /** Proposals that passed administrative validation (status = administrasi_valid). */
    lolos: number;
    /** Rejected proposals (status = ditolak). */
    gagal: number;
    /** Proposals still in draft state (status = draft). */
    draft: number;
    /** Percentage of lolos out of total decided (lolos + gagal), 0–100. */
    success_rate: number;
    /** Sum of `total_pendanaan_disetujui` for all lolos proposals (IDR). */
    total_pendanaan: number;
}

/**
 * Dashboard statistics for the User (Peneliti/Dosen) role.
 * The `stats` prop holds proposal riset counts injected by DashboardController.
 */
interface DashboardStats {
    /** Total proposals (mirrors proposal_stats.total via the controller). */
    total_proposals: number;
    /** Proposals awaiting review. */
    proposal_masuk: number;
    /** Proposals that passed admin validation. */
    proposal_lolos: number;
    /** Rejected proposals. */
    proposal_gagal: number;
    /** Draft proposals. */
    proposal_draft: number;
    /** Aggregate approved funding amount in IDR. */
    total_pendanaan: number;
    /** Kept for backward compatibility but not rendered. */
    total_journals?: number;
    total_assessments?: number;
    average_score?: number;
}

interface UserDashboardProps extends PageProps {
    stats: DashboardStats;
    proposal_stats: ProposalStats;
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

// ─────────────────────────────────────────────────────────────────────────────
// Helper – format IDR currency
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a numeric value as Indonesian Rupiah (IDR).
 *
 * @param amount - The numeric amount in IDR.
 * @returns Formatted string, e.g. "Rp 500.000.000"
 */
function formatRupiah(amount: number): string {
    if (amount === 0) return 'Rp 0';
    // Use Intl.NumberFormat for locale-aware formatting
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — circular progress ring (success rate visualisation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders an animated SVG progress ring showing the proposal success rate.
 *
 * @param rate - A value between 0 and 100 representing the success percentage.
 */
function SuccessRing({ rate }: { rate: number }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const filled = (rate / 100) * circumference;
    const color = rate >= 75 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-red-500';

    return (
        <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
                {/* Track */}
                <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
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

/**
 * User (Peneliti/Dosen) personal research-proposal dashboard.
 *
 * Renders KPI cards and analytics sourced from the `proposals` table per
 * Modul 6 – Dashboard dan Pelaporan specification (Kelas B).
 */
export default function UserDashboard({ stats, proposal_stats }: UserDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Peneliti" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                {/* ── Welcome banner ─────────────────────────────────────── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Selamat datang, <span className="text-primary">{user.name}</span> 👋
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Berikut ringkasan proposal riset dan pendanaan penelitian Anda.</p>
                    </div>
                    <Link
                        href={route('proposal.index')}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted sm:mt-0 dark:bg-neutral-950"
                    >
                        <FileText className="h-4 w-4" />
                        Proposal Saya
                    </Link>
                </div>

                {/* ── Section: Ringkasan Proposal Riset ───────────────────── */}
                <section aria-labelledby="proposal-section-title">
                    <h2 id="proposal-section-title" className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Ringkasan Proposal Riset
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Total Proposal */}
                        <StatsCard
                            title="Total Proposal"
                            value={proposal_stats.total}
                            description="Semua proposal yang pernah diajukan"
                            icon={FileText}
                            variant="default"
                            id="stat-proposal-total"
                        />

                        {/* Draft */}
                        <StatsCard
                            title="Draft"
                            value={proposal_stats.draft}
                            description="Proposal yang belum dikirim"
                            icon={DraftingCompass}
                            variant="blue"
                            id="stat-proposal-draft"
                        />

                        {/* Diajukan / Masuk */}
                        <StatsCard
                            title="Menunggu Review"
                            value={proposal_stats.masuk}
                            description="Diajukan, menunggu verifikasi admin"
                            icon={InboxIcon}
                            variant="amber"
                            id="stat-proposal-masuk"
                        />
                    </div>
                </section>

                {/* ── Section: Hasil Seleksi ───────────────────────────────── */}
                <section aria-labelledby="seleksi-section-title">
                    <h2 id="seleksi-section-title" className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Hasil Seleksi Administrasi
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Diterima / Lolos */}
                        <StatsCard
                            title="Diterima (Valid Administrasi)"
                            value={proposal_stats.lolos}
                            description="Proposal lulus verifikasi administrasi"
                            icon={CheckCircle}
                            variant="green"
                            id="stat-proposal-lolos"
                        />

                        {/* Ditolak / Gagal */}
                        <StatsCard
                            title="Ditolak"
                            value={proposal_stats.gagal}
                            description="Proposal tidak lolos seleksi administrasi"
                            icon={XCircle}
                            variant="red"
                            id="stat-proposal-gagal"
                        />
                    </div>
                </section>

                {/* ── Section: Pendanaan Riset ─────────────────────────────── */}
                <section aria-labelledby="pendanaan-section-title">
                    <h2 id="pendanaan-section-title" className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Metrik Pendanaan Riset
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Total Pendanaan Disetujui */}
                        <StatsCard
                            title="Total Pendanaan Disetujui"
                            value={formatRupiah(proposal_stats.total_pendanaan)}
                            description="Akumulasi dana dari semua proposal yang diterima"
                            icon={ClipboardList}
                            variant="purple"
                            id="stat-total-pendanaan"
                        />

                        {/* Tingkat Keberhasilan (numeric) */}
                        <StatsCard
                            title="Tingkat Keberhasilan"
                            value={proposal_stats.success_rate !== null ? `${Number(proposal_stats.success_rate).toFixed(1)}%` : '—'}
                            description="Persentase proposal diterima dari total yang diputuskan"
                            icon={Percent}
                            variant="cyan"
                            progress={proposal_stats.success_rate ? Math.min(100, Number(proposal_stats.success_rate)) : 0}
                            progressLabel="Tingkat keberhasilan"
                            id="stat-success-rate"
                        />
                    </div>
                </section>

                {/* ── Success Rate Ring Card ───────────────────────────────── */}
                {(proposal_stats.lolos > 0 || proposal_stats.gagal > 0) && (
                    <section aria-labelledby="success-rate-title">
                        <h2 id="success-rate-title" className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
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
                                    <p className="text-base font-semibold">Tingkat Keberhasilan Proposal Riset</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Persentase proposal yang diterima (administrasi valid) dari total proposal yang telah mendapat keputusan akhir
                                        (diterima + ditolak).
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-6">
                                        {/* Diterima */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Diterima: <strong className="text-foreground">{proposal_stats.lolos}</strong>
                                            </span>
                                        </div>
                                        {/* Ditolak */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Ditolak: <strong className="text-foreground">{proposal_stats.gagal}</strong>
                                            </span>
                                        </div>
                                        {/* Menunggu */}
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                                            <span className="text-sm text-muted-foreground">
                                                Menunggu: <strong className="text-foreground">{proposal_stats.masuk}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Keberhasilan</span>
                                            <span className="font-semibold">{proposal_stats.success_rate}%</span>
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

                {/* ── Empty state — belum ada proposal ────────────────────── */}
                {proposal_stats.total === 0 && (
                    <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 bg-white p-8 text-center dark:border-sidebar-border dark:bg-neutral-950">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Belum Ada Proposal Riset</h3>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            Anda belum mengajukan proposal penelitian apapun. Mulai dengan membuat proposal pertama Anda.
                        </p>
                        <Link
                            href={route('user.pembinaan.akreditasi')}
                            id="btn-buat-proposal"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        >
                            <FileText className="h-4 w-4" />
                            Buat Proposal
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
