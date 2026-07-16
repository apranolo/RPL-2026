/**
 * @file PieChart.tsx
 * @description Komponen grafik lingkaran (Pie Chart) untuk memvisualisasikan sebaran kategori proposal berdasarkan skema.
 * @module Dashboard/Reporting/Charts
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApexOptions } from 'apexcharts';
import { AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';

/**
 * Single category data point for the pie chart
 */
export interface PieChartCategory {
    /** Display label (e.g. "SINTA 1", "Non-SINTA") */
    label: string;
    /** Numeric value / count */
    value: number;
    /** Pre-calculated percentage (0-100) */
    percentage: number;
}

interface PieChartProps {
    /** Chart title */
    title: string;
    /** Optional chart description */
    description?: string;
    /** Array of category data points */
    categories: PieChartCategory[];
    /** Total value shown in center of donut */
    total?: number;
    /** Center label text (default: "Total") */
    centerLabel?: string;
    /** Chart height in pixels (default: 350) */
    height?: number;
    /** Use donut style instead of full pie (default: true) */
    donut?: boolean;
    /** Custom color palette (hex strings) */
    colors?: string[];
}

/**
 * Error Boundary for chart rendering failures
 */
class ChartErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('PieChart rendering error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p>Chart gagal dimuat</p>
                    <p className="text-xs">{this.state.error?.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Default color palette for pie chart segments.
 * Provides distinct, accessible colors for up to 8 categories.
 */
const DEFAULT_COLORS_LIGHT = [
    '#0c4a6e', // Deep navy (SINTA 1)
    '#0369a1', // Ocean blue (SINTA 2)
    '#059669', // Emerald green (SINTA 3)
    '#d97706', // Amber (SINTA 4)
    '#dc2626', // Red (SINTA 5)
    '#7c3aed', // Violet (SINTA 6)
    '#94a3b8', // Slate gray (Non-SINTA)
    '#ec4899', // Pink (extra)
];

const DEFAULT_COLORS_DARK = [
    '#3b82f6', // Bright blue (SINTA 1)
    '#06b6d4', // Cyan (SINTA 2)
    '#10b981', // Emerald (SINTA 3)
    '#f59e0b', // Amber (SINTA 4)
    '#ef4444', // Red (SINTA 5)
    '#8b5cf6', // Violet (SINTA 6)
    '#94a3b8', // Slate gray (Non-SINTA)
    '#f472b6', // Pink (extra)
];

/**
 * PieChart — Reusable pie/donut chart component for category visualization.
 *
 * Built on top of react-apexcharts with full dark mode support,
 * accessible labels, and a responsive design.
 *
 * Usage:
 * ```tsx
 * <PieChart
 *   title="Distribusi Kategori SINTA"
 *   description="Persentase jurnal berdasarkan peringkat SINTA"
 *   categories={categoryData}
 *   total={100}
 * />
 * ```
 */
export default function PieChart({
    title,
    description,
    categories,
    total,
    centerLabel = 'Total',
    height = 350,
    donut = true,
    colors,
}: PieChartProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';

    // Filter out zero-value categories to avoid invisible segments
    const filteredCategories = useMemo(() => categories.filter((cat) => cat.value > 0), [categories]);

    // Compute total from data if not provided
    const computedTotal = useMemo(() => total ?? categories.reduce((sum, cat) => sum + cat.value, 0), [total, categories]);

    // Select color palette
    const colorPalette = useMemo(() => {
        if (colors) return colors;
        return isDarkMode ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT;
    }, [colors, isDarkMode]);

    // Theme-aware text colors
    const themeColors = useMemo(
        () => ({
            text: isDarkMode ? '#f3f4f6' : '#1f2937',
            subtleText: isDarkMode ? '#9ca3af' : '#6b7280',
            chartTheme: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light',
        }),
        [isDarkMode],
    );

    // ApexCharts configuration
    const chartOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: donut ? 'donut' : 'pie',
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                foreColor: themeColors.text,
            },
            labels: filteredCategories.map((cat) => cat.label),
            colors: colorPalette.slice(0, filteredCategories.length),
            dataLabels: {
                enabled: true,
                formatter: (val: number) => `${Number(val).toFixed(1)}%`,
                style: {
                    colors: [isDarkMode ? '#ffffff' : '#1f2937'],
                    fontWeight: 700,
                    fontSize: '12px',
                },
                background: {
                    enabled: true,
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
                    donut: donut
                        ? {
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
                                    color: isDarkMode ? '#ffffff' : '#0f172a',
                                },
                                total: {
                                    show: true,
                                    label: centerLabel,
                                    color: themeColors.subtleText,
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    formatter: () => computedTotal.toString(),
                                },
                            },
                        }
                        : undefined,
                },
            },
            stroke: {
                colors: isDarkMode ? ['#374151'] : ['#ffffff'],
                width: 3,
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: { height: 280 },
                        legend: { position: 'bottom', fontSize: '10px' },
                    },
                },
            ],
        }),
        [filteredCategories, colorPalette, themeColors, isDarkMode, donut, centerLabel, computedTotal],
    );

    const chartSeries = useMemo(() => filteredCategories.map((cat) => cat.value), [filteredCategories]);

    // Empty state
    const hasData = filteredCategories.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {!mounted ? (
                    // Loading skeleton
                    <div className="flex items-center justify-center" style={{ height }}>
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : hasData ? (
                    <ChartErrorBoundary>
                        <div role="img" aria-label={`Pie chart: ${title}`}>
                            <Chart
                                key={`pie-${isDarkMode ? 'dark' : 'light'}-${filteredCategories.length}`}
                                options={chartOptions}
                                series={chartSeries}
                                type={donut ? 'donut' : 'pie'}
                                height={height}
                            />
                        </div>
                    </ChartErrorBoundary>
                ) : (
                    // Empty state
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground" style={{ height }}>
                        <PieChartIcon className="h-10 w-10 opacity-40" />
                        <p className="text-sm">Tidak ada data untuk ditampilkan</p>
                    </div>
                )}

                {/* Legend summary below chart */}
                {hasData && mounted && (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-3 md:grid-cols-4">
                        {filteredCategories.map((cat, idx) => (
                            <div key={cat.label} className="flex items-center gap-2 text-xs">
                                <div
                                    className="h-3 w-3 shrink-0 rounded-sm"
                                    style={{ backgroundColor: colorPalette[idx % colorPalette.length] }}
                                />
                                <span className="truncate text-muted-foreground">{cat.label}</span>
                                <span className="ml-auto font-semibold">{cat.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
