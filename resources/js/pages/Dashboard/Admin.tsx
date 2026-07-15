/**
 * Admin Dashboard Page Component
 *
 * @description
 * Dashboard LPPM Helicopter View / Admin Kampus for visualising research, funding, performance, and activity logs.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Dashboard/Admin.tsx
 */

import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import BarChart from '@/components/Charts/BarChart';
import PieChart from '@/components/Charts/PieChart';
import FacultyTable from '@/components/FacultyTable';
import TopLecturerList from '@/components/TopLecturerList';
import TopResearchList from '@/components/TopResearchList';
import ActivityLog from '@/components/ActivityLog';
import { type BreadcrumbItem } from '@/types';
import { FileText, DollarSign, Percent, CheckCircle, XCircle } from 'lucide-react';

interface DashboardStats {
    total_proposals: number;
    approved_proposals: number;
    rejected_proposals: number;
    success_rate: number;
    total_absorbed_funding: number;
}

interface FacultyPerformanceItem {
    faculty_name: string;
    submitted: number;
    accepted: number;
}

interface ResearchItem {
    id: number;
    title: string;
    citations: number;
}

interface LecturerItem {
    name: string;
    score: number;
}

interface ActivityLogItem {
    id: number;
    action: string;
    description: string;
    created_at: string;
    user: { name: string } | null;
}

interface Props {
    stats: DashboardStats;
    yearlyFundingData: { year: number; amount: number }[];
    facultyPerformance: FacultyPerformanceItem[];
    topResearch: ResearchItem[];
    topLecturers: LecturerItem[];
    systemLogs: ActivityLogItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard LPPM',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard({
    stats,
    yearlyFundingData,
    facultyPerformance,
    topResearch,
    topLecturers,
    systemLogs,
}: Props) {
    
    // Format currency to IDR
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Map faculty performance to category distribution for PieChart
    const pieChartData = facultyPerformance.map(item => ({
        name: item.faculty_name,
        value: item.submitted
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard LPPM" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6 bg-slate-50/50 dark:bg-neutral-900/30">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard Admin LPPM
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Helicopter-view data riset universitas, sebaran kategori proposal, performa fakultas, klasemen, dan CCTV log.
                    </p>
                </div>

                {/* ROW 1: Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Anggaran Terserap */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shrink-0">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Dana Terserap</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total_absorbed_funding)}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Dari kontrak aktif dan selesai</p>
                        </div>
                    </div>

                    {/* Card 2: Total Proposal */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shrink-0">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Proposal Masuk</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total_proposals}</h3>
                            <p className="text-xs text-gray-450 mt-0.5 flex gap-2">
                                <span className="text-green-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> {stats.approved_proposals} Diterima</span>
                                <span className="text-red-500 flex items-center gap-0.5"><XCircle className="h-3 w-3" /> {stats.rejected_proposals} Ditolak</span>
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Success Rate */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 shrink-0">
                            <Percent className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rasio Keberhasilan</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.success_rate}%</h3>
                            <p className="text-xs text-gray-450 mt-0.5">Persentase kelulusan proposal</p>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Graphs Split Screen */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Left: BarChart (60%) */}
                    <div className="lg:col-span-3 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                            Statistik Pendanaan Tahunan
                        </h2>
                        <BarChart data={yearlyFundingData} />
                    </div>

                    {/* Right: PieChart (40%) */}
                    <div className="lg:col-span-2 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                            Sebaran Bidang Ilmu / Kategori Proposal
                        </h2>
                        <PieChart data={pieChartData} />
                    </div>
                </div>

                {/* ROW 3: Leaderboard & Logs */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Col 1: Top Dosen */}
                    <TopLecturerList data={topLecturers} />

                    {/* Col 2: Top Riset */}
                    <TopResearchList data={topResearch} />

                    {/* Col 3: CCTV Logs */}
                    <div className="h-full">
                        <ActivityLog logs={systemLogs} title="CCTV System Live Logs" />
                    </div>
                </div>

                {/* ROW 4: Detailed Faculty Table */}
                <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                        Rekapitulasi Performa per Bidang / Fakultas
                    </h2>
                    <FacultyTable data={facultyPerformance} />
                </div>
            </div>
        </AppLayout>
    );
}
