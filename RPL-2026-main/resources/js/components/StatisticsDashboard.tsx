import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalStatistics } from '@/types';
import { ApexOptions } from 'apexcharts';
import { AlertCircle, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';

interface StatisticsDashboardProps {
    statistics: JournalStatistics;
}

/**
 * Error Boundary for Chart Rendering
 * Catches errors in chart components and displays fallback UI
 */
class ChartErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error?: Error }> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Chart rendering error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p>Chart failed to load</p>
                        <p className="text-xs">{this.state.error?.message}</p>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

/**
 * Statistics Dashboard Component
 *
 * Displays journal statistics with interactive charts:
 * - Indexation distribution (Horizontal Bar Chart)
 * - Accreditation/SINTA distribution (Donut Chart)
 * - Scientific Field distribution (Bar Chart)
 */
export default function StatisticsDashboard({ statistics }: StatisticsDashboardProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch - wait for client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Default to light mode if theme not resolved yet
    const isDarkMode = mounted && resolvedTheme === 'dark';

    // Memoized theme colors configuration for chart consistency
    const themeColors = useMemo(
        () => ({
            text: isDarkMode ? '#f3f4f6' : '#1f2937',
            subtleText: isDarkMode ? '#9ca3af' : '#6b7280',
            chartTheme: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light',
            // Distinctive color palette - brighter colors for dark mode visibility
            indexation: isDarkMode ? '#38bdf8' : '#0ea5e9', // Brighter sky blue for dark mode
            accreditation: isDarkMode
                ? [
                      '#94a3b8', // Non-Sinta (slate gray)
                      '#3b82f6', // SINTA 1 (bright blue)
                      '#06b6d4', // SINTA 2 (cyan)
                      '#10b981', // SINTA 3 (emerald)
                      '#f59e0b', // SINTA 4 (amber)
                      '#ef4444', // SINTA 5 (red)
                      '#8b5cf6', // SINTA 6 (violet)
                  ]
                : [
                      '#94a3b8', // Non-Sinta (slate gray)
                      '#0c4a6e', // SINTA 1 (deep navy)
                      '#0369a1', // SINTA 2 (ocean blue)
                      '#059669', // SINTA 3 (emerald green)
                      '#d97706', // SINTA 4 (amber)
                      '#dc2626', // SINTA 5 (red)
                      '#7c3aed', // SINTA 6 (violet)
                  ],
            scientificField: isDarkMode ? '#34d399' : '#10b981', // Brighter emerald for dark mode
        }),
        [isDarkMode],
    );

    // Indexation Chart Configuration with accessibility
    const indexationChartOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: 'bar',
                toolbar: { show: false },
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                foreColor: themeColors.text,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 6,
                    dataLabels: {
                        position: 'top',
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => val.toString(),
                offsetX: 0,
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    colors: [isDarkMode ? '#fff' : '#1f2937'], // Light text in dark mode, dark text in light mode
                },
            },
            colors: [themeColors.indexation],
            xaxis: {
                categories: statistics.by_indexation.map((item) => item.name),
                title: { text: 'Jumlah Jurnal', style: { color: themeColors.text, fontWeight: 600 } },
                labels: { style: { colors: themeColors.text, fontSize: '11px', fontWeight: 500 } },
            },
            yaxis: {
                title: { text: '', style: { color: themeColors.text } },
                labels: { style: { colors: themeColors.text } },
            },
            tooltip: {
                theme: themeColors.chartTheme,
                y: {
                    formatter: (val: number, opts?: { dataPointIndex?: number }) => {
                        const index = opts?.dataPointIndex ?? 0;
                        const percentage = statistics.by_indexation[index]?.percentage ?? 0;
                        return `${val} jurnal (${percentage.toFixed(1)}%)`;
                    },
                },
                style: {
                    fontSize: '12px',
                },
            },
        }),
        [statistics.by_indexation, themeColors, isDarkMode],
    );

    const indexationChartSeries = [
        {
            name: 'Jurnal per Platform',
            data: statistics.by_indexation.map((item) => item.count),
        },
    ];

    // Filter out zero-count categories to avoid invisible segments in donut chart
    const filteredAccreditationData = useMemo(() => statistics.by_accreditation.filter((item) => item.count > 0), [statistics.by_accreditation]);

    // Accreditation/SINTA Chart Configuration with accessibility
    const accreditationChartOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: 'donut',
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                foreColor: themeColors.text,
            },
            labels: filteredAccreditationData.map((item) => item.label),
            colors: themeColors.accreditation,
            dataLabels: {
                enabled: true,
                formatter: (val: number) => `${Number(val).toFixed(1)}%`,
                style: {
                    colors: [isDarkMode ? '#ffffff' : '#1f2937'], // Pure white in dark mode for better readability
                    fontWeight: 700,
                    fontSize: '13px',
                },
                background: {
                    enabled: true, // Always enable background for better contrast
                    foreColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderRadius: 3,
                    padding: 4,
                    opacity: 0.95,
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: isDarkMode ? '#374151' : 'transparent',
                },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: {
                    colors: themeColors.text,
                    useSeriesColors: false,
                },
                fontSize: '12px',
                fontWeight: 600,
                markers: {
                    width: 12,
                    height: 12,
                    radius: 2,
                    offsetX: -5,
                },
            },
            tooltip: {
                theme: themeColors.chartTheme,
                y: {
                    formatter: (val: number) => `${val} jurnal`,
                },
                style: {
                    fontSize: '12px',
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                color: themeColors.text,
                                fontWeight: 600,
                                fontSize: '13px',
                            },
                            value: {
                                show: true,
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: isDarkMode ? '#ffffff' : '#0f172a', // Pure white in dark mode
                            },
                            total: {
                                show: true,
                                label: 'Total Jurnal',
                                color: isDarkMode ? '#9ca3af' : '#6b7280', // Better contrast in dark mode
                                fontWeight: 600,
                                fontSize: '12px',
                                formatter: () => statistics.totals.total_journals.toString(),
                            },
                        },
                    },
                },
            },
            stroke: {
                colors: isDarkMode ? ['#374151'] : ['#ffffff'], // Lighter gray stroke in dark mode for segment separation
                width: 3, // Increased width for better segment visibility
            },
        }),
        [filteredAccreditationData, statistics.totals.total_journals, themeColors, isDarkMode],
    );

    const accreditationChartSeries = filteredAccreditationData.map((item) => item.count);

    // Scientific Field Chart Configuration with accessibility
    const scientificFieldChartOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: 'bar',
                toolbar: { show: false },
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                foreColor: themeColors.text,
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    dataLabels: {
                        position: 'top',
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => val.toString(),
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    colors: [isDarkMode ? '#e5e7eb' : '#334155'],
                },
            },
            colors: [themeColors.scientificField],
            xaxis: {
                categories: statistics.by_scientific_field.map((item) => item.name),
                title: { text: '', style: { color: themeColors.text } },
                labels: {
                    rotate: -45,
                    rotateAlways: true,
                    style: {
                        fontSize: '11px',
                        colors: themeColors.text,
                        fontWeight: 500,
                    },
                },
            },
            yaxis: {
                title: { text: 'Jumlah Jurnal', style: { color: themeColors.text, fontWeight: 600 } },
                labels: { style: { colors: themeColors.text } },
            },
            tooltip: {
                theme: themeColors.chartTheme,
                y: {
                    formatter: (val: number, opts?: { dataPointIndex?: number }) => {
                        const index = opts?.dataPointIndex ?? 0;
                        const percentage = statistics.by_scientific_field[index]?.percentage ?? 0;
                        return `${val} jurnal (${percentage.toFixed(1)}%)`;
                    },
                },
                style: {
                    fontSize: '12px',
                },
            },
        }),
        [statistics.by_scientific_field, themeColors, isDarkMode],
    );

    const scientificFieldChartSeries = [
        {
            name: 'Jurnal',
            data: statistics.by_scientific_field.map((item) => item.count),
        },
    ];

    // Check if there's no data
    const hasIndexationData = statistics.by_indexation.length > 0;
    const hasAccreditationData = filteredAccreditationData.length > 0;
    const hasScientificFieldData = statistics.by_scientific_field.length > 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jurnal</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.total_journals}</div>
                        <p className="text-xs text-muted-foreground">Jurnal di universitas Anda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jurnal Terindeks Scopus</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.indexed_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.indexed_journals / statistics.totals.total_journals) * 100)}% dari total`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jurnal SINTA</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.sinta_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.sinta_journals / statistics.totals.total_journals) * 100)}% terakreditasi SINTA`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Non-SINTA</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.non_sinta_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.non_sinta_journals / statistics.totals.total_journals) * 100)}% belum terakreditasi`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Indexation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Indeksasi</CardTitle>
                        <CardDescription>Jumlah jurnal berdasarkan platform indeksasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!mounted ? (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                        ) : hasIndexationData ? (
                            <ChartErrorBoundary>
                                <div role="img" aria-label="Bar chart showing journal distribution by indexation platform">
                                    <Chart
                                        key={`bar-indexation-${isDarkMode ? 'dark' : 'light'}`}
                                        options={indexationChartOptions}
                                        series={indexationChartSeries}
                                        type="bar"
                                        height={300}
                                    />
                                </div>
                            </ChartErrorBoundary>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground" role="status">
                                Tidak ada data indeksasi
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Accreditation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Akreditasi SINTA</CardTitle>
                        <CardDescription>Persentase jurnal berdasarkan ranking SINTA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!mounted ? (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                        ) : hasAccreditationData ? (
                            <ChartErrorBoundary>
                                <div role="img" aria-label="Donut chart showing journal distribution by SINTA accreditation ranking">
                                    <Chart
                                        key={`donut-${isDarkMode ? 'dark' : 'light'}`}
                                        options={accreditationChartOptions}
                                        series={accreditationChartSeries}
                                        type="donut"
                                        height={300}
                                    />
                                </div>
                            </ChartErrorBoundary>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground" role="status">
                                Tidak ada data akreditasi
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Scientific Field Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Bidang Ilmu</CardTitle>
                        <CardDescription>Jumlah jurnal per bidang ilmu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!mounted ? (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                        ) : hasScientificFieldData ? (
                            <ChartErrorBoundary>
                                <div role="img" aria-label="Bar chart showing journal distribution by scientific field">
                                    <Chart
                                        key={`bar-scientific-${isDarkMode ? 'dark' : 'light'}`}
                                        options={scientificFieldChartOptions}
                                        series={scientificFieldChartSeries}
                                        type="bar"
                                        height={300}
                                    />
                                </div>
                            </ChartErrorBoundary>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground" role="status">
                                Tidak ada data bidang ilmu
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
