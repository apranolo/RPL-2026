/**
 * @route /profile/citation (profile.citation)
 * @features
 *  - Analytic dashboard for the logged-in Dosen's citation portfolio
 *  - Widgets: H-Index and Total Sitasi (big numbers)
 *  - Interactive line chart of yearly citation trend (ApexCharts)
 *  - "Sinkronisasi Google Scholar" button (async loading state) top-right
 *  - Last-synced timestamp; empty state when data has never been synced
 * @description
 * Shows the authenticated user's Google Scholar citation statistics as
 * provided by CitationController@show. Syncing POSTs to
 * profile.citation.sync and redirects back with a success toast.
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

function useIsDark() {
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Citation Profile', href: '/profile/citation' }];

interface Citation {
    id: number;
    id_user: number;
    h_index: number;
    total_citations: number;
    yearly_data: { year: number; citations: number }[] | null;
    last_synced_at: string | null;
}

interface Props extends PageProps {
    citationData: Citation | null;
}

function SyncButton({ syncing, onClick }: { syncing: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
            >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
            </svg>
            {syncing ? 'Menyinkronkan...' : 'Sinkronisasi Google Scholar'}
        </button>
    );
}

export default function CitationProfile({ citationData }: Props) {
    const isDark = useIsDark();
    const [syncing, setSyncing] = useState(false);

    function handleSync() {
        setSyncing(true);
        router.post(route('profile.citation.sync'), {}, { onFinish: () => setSyncing(false) });
    }

    const yearlyData = citationData?.yearly_data ?? [];
    const years = yearlyData.map((d) => String(d.year));
    const counts = yearlyData.map((d) => d.citations);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citation Profile" />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header with sync action (top-right per spec) */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Portofolio Sitasi</h1>
                        {citationData?.last_synced_at && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Terakhir disinkronkan:{' '}
                                {new Date(citationData.last_synced_at).toLocaleString('id-ID', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </p>
                        )}
                    </div>
                    <SyncButton syncing={syncing} onClick={handleSync} />
                </div>

                {citationData === null ? (
                    /* Empty state — never synced */
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-sidebar-border/70 bg-white px-6 py-16 text-center dark:border-sidebar-border dark:bg-neutral-950">
                        <p className="font-medium">Belum ada data sitasi</p>
                        <p className="max-w-md text-sm text-muted-foreground">
                            Klik tombol "Sinkronisasi Google Scholar" untuk menarik statistik sitasi dan h-index Anda dari Google Scholar.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stat widgets */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                { label: 'H-Index', value: citationData.h_index },
                                { label: 'Total Sitasi', value: citationData.total_citations.toLocaleString('id-ID') },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-sidebar-border/70 bg-white p-6 text-center dark:border-sidebar-border dark:bg-neutral-950"
                                >
                                    <div className="text-4xl font-bold text-primary">{stat.value}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Yearly citation trend (line chart per spec) */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                            <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Tren Sitasi Tahunan</h2>
                            <ReactApexChart
                                type="line"
                                height={260}
                                series={[{ name: 'Sitasi', data: counts }]}
                                options={{
                                    chart: {
                                        toolbar: { show: false },
                                        animations: { enabled: true },
                                        foreColor: isDark ? '#a3a3a3' : '#6b7280',
                                    },
                                    stroke: { curve: 'smooth', width: 2 },
                                    markers: { size: 4, hover: { size: 6 } },
                                    dataLabels: { enabled: false },
                                    xaxis: { categories: years },
                                    yaxis: { labels: { formatter: (v) => String(Math.round(v)) } },
                                    tooltip: {
                                        theme: isDark ? 'dark' : 'light',
                                        y: { formatter: (v) => `${v} sitasi` },
                                    },
                                    grid: { borderColor: isDark ? '#262626' : '#e5e7eb' },
                                    colors: ['hsl(var(--primary))'],
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
