import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import BarChart from '@/components/Charts/BarChart';
import { type BreadcrumbItem } from '@/types';

interface FundingData {
    year: number;
    total: number;
}

interface Stats {
    total_users: number;
    total_journals: number;
}

interface Props {
    stats: Stats;
    fundingData: FundingData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Pimpinan',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard({ stats, fundingData }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pimpinan" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard Pimpinan / Admin Kampus
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Ringkasan statistik data sistem dan agregasi pendanaan tahunan.
                    </p>
                </div>

                <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                                <h3 className="mt-2 text-3xl font-bold">{stats.total_users}</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Jurnal</p>
                                <h3 className="mt-2 text-3xl font-bold">{stats.total_journals}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-2 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                        Statistik Pendanaan Tahunan
                    </h2>
                    <BarChart data={fundingData} />
                </div>
            </div>
        </AppLayout>
    );
}
