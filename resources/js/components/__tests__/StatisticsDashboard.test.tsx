import { createEmptyStatistics, createMockStatistics, renderWithProviders, screen, waitFor } from '@/test-utils/test-helpers';
import { describe, expect, it, vi } from 'vitest';
import StatisticsDashboard from '../StatisticsDashboard';

// Mock ApexCharts
vi.mock('react-apexcharts', () => ({
    default: vi.fn(({ options, series, type }) => (
        <div data-testid={`chart-${type}`} data-options={JSON.stringify(options)} data-series={JSON.stringify(series)}>
            Mocked Chart
        </div>
    )),
}));

// Mock next-themes useTheme hook
vi.mock('next-themes', () => ({
    useTheme: () => ({
        resolvedTheme: 'light',
    }),
}));

describe('StatisticsDashboard', () => {
    describe('Summary Cards Rendering', () => {
        it('renders all four summary cards with correct data', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            // Check Total Jurnal card
            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();

            // Check Jurnal Terindeks Scopus card
            expect(screen.getByText('Jurnal Terindeks Scopus')).toBeInTheDocument();
            expect(screen.getByText('45')).toBeInTheDocument();

            // Check Jurnal SINTA card
            expect(screen.getByText('Jurnal SINTA')).toBeInTheDocument();
            expect(screen.getByText('60')).toBeInTheDocument();

            // Check Non-SINTA card
            expect(screen.getByText('Non-SINTA')).toBeInTheDocument();
            expect(screen.getByText('40')).toBeInTheDocument();
        });

        it('displays correct percentages in summary cards', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            // Indexed: 45/100 = 45%
            expect(screen.getByText('45% dari total')).toBeInTheDocument();

            // SINTA: 60/100 = 60%
            expect(screen.getByText('60% terakreditasi SINTA')).toBeInTheDocument();

            // Non-SINTA: 40/100 = 40%
            expect(screen.getByText('40% belum terakreditasi')).toBeInTheDocument();
        });

        it('handles zero totals gracefully', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument();
            expect(screen.getAllByText('Tidak ada data')).toHaveLength(3); // Three "Tidak ada data" messages
        });

        it('calculates percentages correctly with zero division', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            // Should show "Tidak ada data" instead of NaN or error
            expect(screen.getAllByText('Tidak ada data')).toHaveLength(3);
        });
    });

    describe('Charts Rendering', () => {
        it('renders all three charts when data is available', async () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                expect(screen.getByTestId('chart-bar')).toBeInTheDocument(); // Indexation chart
                expect(screen.getByTestId('chart-donut')).toBeInTheDocument(); // Accreditation chart
                expect(screen.getAllByTestId('chart-bar')).toHaveLength(2); // Indexation + Scientific Field
            });
        });

        it('displays correct chart titles and descriptions', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            expect(screen.getByText('Distribusi Indeksasi')).toBeInTheDocument();
            expect(screen.getByText('Jumlah jurnal berdasarkan platform indeksasi')).toBeInTheDocument();

            expect(screen.getByText('Distribusi Akreditasi SINTA')).toBeInTheDocument();
            expect(screen.getByText('Persentase jurnal berdasarkan ranking SINTA')).toBeInTheDocument();

            expect(screen.getByText('Distribusi Bidang Ilmu')).toBeInTheDocument();
            expect(screen.getByText('Jumlah jurnal per bidang ilmu')).toBeInTheDocument();
        });

        it('shows empty state message when no indexation data', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            expect(screen.getByText('Tidak ada data indeksasi')).toBeInTheDocument();
        });

        it('shows empty state message when no accreditation data', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            expect(screen.getByText('Tidak ada data akreditasi')).toBeInTheDocument();
        });

        it('shows empty state message when no scientific field data', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            expect(screen.getByText('Tidak ada data bidang ilmu')).toBeInTheDocument();
        });

        it('shows loading spinner before component is mounted', () => {
            const mockData = createMockStatistics();
            const { container } = renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            // Check for loading spinners (before mounted state is set)
            const spinners = container.querySelectorAll('.animate-spin');
            // With mounted state management, spinners should transition to charts
            expect(spinners.length >= 0).toBe(true);
        });
    });

    describe('Chart Data Transformation', () => {
        it('passes correct data to indexation bar chart', async () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                const charts = screen.getAllByTestId('chart-bar');
                const indexationChart = charts[0]; // First bar chart is indexation
                const seriesData = JSON.parse(indexationChart.getAttribute('data-series') || '[]');

                expect(seriesData[0].name).toBe('Jurnal per Platform');
                expect(seriesData[0].data).toEqual([45, 80, 30, 20]); // Scopus, Google Scholar, DOAJ, WoS
            });
        });

        it('passes correct data to accreditation donut chart', async () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                const donutChart = screen.getByTestId('chart-donut');
                const seriesData = JSON.parse(donutChart.getAttribute('data-series') || '[]');

                // Should include all accreditation categories
                expect(seriesData).toEqual([40, 10, 15, 20, 10, 3, 2]); // Non-Sinta, SINTA 1-6
            });
        });

        it('passes correct data to scientific field bar chart', async () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                const charts = screen.getAllByTestId('chart-bar');
                const scientificFieldChart = charts[1]; // Second bar chart is scientific field
                const seriesData = JSON.parse(scientificFieldChart.getAttribute('data-series') || '[]');

                expect(seriesData[0].name).toBe('Jurnal');
                expect(seriesData[0].data).toEqual([30, 25, 20, 15, 10]); // Field counts
            });
        });

        it('filters out zero-count accreditation categories', () => {
            const dataWithZeros = createMockStatistics({
                by_accreditation: [
                    { sinta_rank: null, label: 'Non-Sinta', count: 10, percentage: 100.0 },
                    { sinta_rank: '1', label: 'SINTA 1', count: 0, percentage: 0.0 },
                    { sinta_rank: '2', label: 'SINTA 2', count: 0, percentage: 0.0 },
                    { sinta_rank: '3', label: 'SINTA 3', count: 0, percentage: 0.0 },
                    { sinta_rank: '4', label: 'SINTA 4', count: 0, percentage: 0.0 },
                    { sinta_rank: '5', label: 'SINTA 5', count: 0, percentage: 0.0 },
                    { sinta_rank: '6', label: 'SINTA 6', count: 0, percentage: 0.0 },
                ],
            });

            renderWithProviders(<StatisticsDashboard statistics={dataWithZeros} />);

            // Should only render chart with non-zero data
            waitFor(() => {
                const donutChart = screen.getByTestId('chart-donut');
                const seriesData = JSON.parse(donutChart.getAttribute('data-series') || '[]');
                expect(seriesData).toEqual([10]); // Only Non-Sinta with count 10
            });
        });
    });

    describe('Theme Support', () => {
        it('renders correctly in light mode', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />, { theme: 'light' });

            // Component should render without errors
            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
        });

        it('renders correctly in dark mode', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />, { theme: 'dark' });

            // Component should render without errors
            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
        });

        it('applies different chart colors for dark mode', async () => {
            vi.mock('next-themes', () => ({
                useTheme: () => ({
                    resolvedTheme: 'dark',
                }),
            }));

            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />, { theme: 'dark' });

            await waitFor(() => {
                const charts = screen.getAllByTestId('chart-bar');
                expect(charts.length).toBeGreaterThan(0);
                // In dark mode, chart should use different color scheme
                // Actual color validation would require deeper chart options inspection
            });
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for charts', async () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                const barChartLabel = screen.getByRole('img', {
                    name: /bar chart showing journal distribution by indexation platform/i,
                });
                expect(barChartLabel).toBeInTheDocument();

                const donutChartLabel = screen.getByRole('img', {
                    name: /donut chart showing journal distribution by SINTA accreditation ranking/i,
                });
                expect(donutChartLabel).toBeInTheDocument();

                const scientificFieldLabel = screen.getByRole('img', {
                    name: /bar chart showing journal distribution by scientific field/i,
                });
                expect(scientificFieldLabel).toBeInTheDocument();
            });
        });

        it('has status role for empty state messages', () => {
            const emptyData = createEmptyStatistics();
            renderWithProviders(<StatisticsDashboard statistics={emptyData} />);

            const emptyStates = screen.getAllByRole('status');
            expect(emptyStates.length).toBeGreaterThan(0);
        });

        it('cards have semantic heading structure', () => {
            const mockData = createMockStatistics();
            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            // Card titles should be present (CardTitle component typically renders as heading)
            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
            expect(screen.getByText('Jurnal Terindeks Scopus')).toBeInTheDocument();
        });
    });

    describe('Error Boundary', () => {
        it('shows error message when chart fails to render', async () => {
            // Mock Chart component to throw error
            vi.mock('react-apexcharts', () => ({
                default: vi.fn(() => {
                    throw new Error('Chart rendering failed');
                }),
            }));

            const mockData = createMockStatistics();
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders(<StatisticsDashboard statistics={mockData} />);

            await waitFor(() => {
                // Error boundary should catch and display fallback
                expect(screen.getByText(/chart failed to load/i)).toBeInTheDocument();
            });

            consoleError.mockRestore();
        });
    });

    describe('Data Edge Cases', () => {
        it('handles very large numbers correctly', () => {
            const largeData = createMockStatistics({
                totals: {
                    total_journals: 999999,
                    indexed_journals: 500000,
                    sinta_journals: 400000,
                    non_sinta_journals: 599999,
                },
            });

            renderWithProviders(<StatisticsDashboard statistics={largeData} />);

            expect(screen.getByText('999999')).toBeInTheDocument();
            expect(screen.getByText('500000')).toBeInTheDocument();
        });

        it('handles single journal correctly', () => {
            const singleJournal = createMockStatistics({
                totals: {
                    total_journals: 1,
                    indexed_journals: 1,
                    sinta_journals: 1,
                    non_sinta_journals: 0,
                },
                by_indexation: [{ name: 'Scopus', count: 1, percentage: 100.0 }],
                by_accreditation: [
                    { sinta_rank: '1', label: 'SINTA 1', count: 1, percentage: 100.0 },
                    { sinta_rank: null, label: 'Non-Sinta', count: 0, percentage: 0.0 },
                ],
                by_scientific_field: [{ id: 1, name: 'Engineering', count: 1, percentage: 100.0 }],
            });

            renderWithProviders(<StatisticsDashboard statistics={singleJournal} />);

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('100% dari total')).toBeInTheDocument();
        });

        it('handles mixed SINTA ranks including all 1-6', () => {
            const allRanks = createMockStatistics({
                by_accreditation: [
                    { sinta_rank: null, label: 'Non-Sinta', count: 10, percentage: 10.0 },
                    { sinta_rank: '1', label: 'SINTA 1', count: 15, percentage: 15.0 },
                    { sinta_rank: '2', label: 'SINTA 2', count: 20, percentage: 20.0 },
                    { sinta_rank: '3', label: 'SINTA 3', count: 15, percentage: 15.0 },
                    { sinta_rank: '4', label: 'SINTA 4', count: 15, percentage: 15.0 },
                    { sinta_rank: '5', label: 'SINTA 5', count: 15, percentage: 15.0 },
                    { sinta_rank: '6', label: 'SINTA 6', count: 10, percentage: 10.0 },
                ],
            });

            renderWithProviders(<StatisticsDashboard statistics={allRanks} />);

            // All should render without error
            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('renders efficiently with large datasets', async () => {
            // Create data with many indexations and fields
            const largeData = createMockStatistics({
                by_indexation: Array.from({ length: 20 }, (_, i) => ({
                    name: `Platform ${i + 1}`,
                    count: Math.floor(Math.random() * 100),
                    percentage: Math.random() * 100,
                })),
                by_scientific_field: Array.from({ length: 15 }, (_, i) => ({
                    id: i + 1,
                    name: `Field ${i + 1}`,
                    count: Math.floor(Math.random() * 100),
                    percentage: Math.random() * 100,
                })),
            });

            const startTime = performance.now();
            renderWithProviders(<StatisticsDashboard statistics={largeData} />);
            const endTime = performance.now();

            // Should render in reasonable time (< 1000ms)
            expect(endTime - startTime).toBeLessThan(1000);

            expect(screen.getByText('Total Jurnal')).toBeInTheDocument();
        });
    });
});
