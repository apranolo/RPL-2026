import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
import ReactApexChart from 'react-apexcharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citation Profile', href: '/admin/citations' },
];

interface Publication {
    title: string;
    year: number;
    citations: number;
}

interface ScholarProfile {
    name: string;
    affiliation: string;
    total_citations: number;
    h_index: number;
    i10_index: number;
    citations_per_year: Record<string, number>;
    publications: Publication[];
}

export default function CitationProfile(_: PageProps) {
    const isDark = useIsDark();
    const [profile, setProfile] = useState<ScholarProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/admin/citations/sync')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    const years = profile ? Object.keys(profile.citations_per_year).sort() : [];
    const counts = profile ? years.map((y) => profile.citations_per_year[y]) : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citation Profile" />
            <div className="flex flex-col gap-6 p-4 sm:p-6">

                {loading && (
                    <div className="flex items-center justify-center py-24 text-muted-foreground">
                        Loading profile...
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                        Failed to load profile: {error}
                    </div>
                )}

                {profile && (
                    <>
                        {/* Header */}
                        <div className="flex items-start gap-5 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                                {profile.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{profile.name}</h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">{profile.affiliation}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Citations', value: profile.total_citations.toLocaleString() },
                                { label: 'h-index', value: profile.h_index },
                                { label: 'i10-index', value: profile.i10_index },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-sidebar-border/70 bg-white p-5 text-center dark:border-sidebar-border dark:bg-neutral-950"
                                >
                                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Citations per year chart */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Citations per Year
                            </h2>
                            <ReactApexChart
                                type="bar"
                                height={220}
                                series={[{ name: 'Citations', data: counts }]}
                                options={{
                                    chart: { toolbar: { show: false }, animations: { enabled: true }, foreColor: isDark ? '#a3a3a3' : '#6b7280' },
                                    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                                    dataLabels: { enabled: false },
                                    xaxis: { categories: years },
                                    yaxis: { labels: { formatter: (v) => String(Math.round(v)) } },
                                    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v) => `${v} citations` } },
                                    grid: { borderColor: isDark ? '#262626' : '#e5e7eb' },
                                    colors: ['hsl(var(--primary))'],
                                }}
                            />
                        </div>

                        {/* Publications */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                            <div className="border-b border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <h2 className="font-semibold">Publications</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Title</th>
                                        <th className="px-6 py-3 text-right font-medium text-muted-foreground">Year</th>
                                        <th className="px-6 py-3 text-right font-medium text-muted-foreground">Cited by</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                    {profile.publications.map((pub, i) => (
                                        <tr key={i} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                            <td className="px-6 py-4 font-medium">{pub.title}</td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">{pub.year}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-primary">{pub.citations}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}