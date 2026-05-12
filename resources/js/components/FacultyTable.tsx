import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * Faculty/University performance statistics shape
 * (matches the data returned by DashboardCtrl::getFacultyStat())
 */
export interface FacultyStat {
    university_id: number;
    university_name: string;
    university_short_name?: string;
    accreditation_status?: string;
    cluster?: string;
    total_users: number;
    total_journals: number;
    approved_journals: number;
    pending_journals: number;
    scopus_indexed: number;
    total_sinta: number;
    sinta_breakdown: Record<string, number>;
    total_assessments: number;
    completed_assessments: number;
    average_score: number;
    assessment_completion_rate: number;
}

interface FacultyTableProps {
    /** Array of faculty statistics from getFacultyStat() */
    data: FacultyStat[];
}

type SortField =
    | 'university_name'
    | 'total_users'
    | 'total_journals'
    | 'scopus_indexed'
    | 'total_sinta'
    | 'average_score'
    | 'assessment_completion_rate';

type SortDirection = 'asc' | 'desc';

/**
 * FacultyTable — Displays a summary table of faculty/university performance
 * statistics on the Admin Dashboard.
 *
 * Features:
 * - Search filtering by university name
 * - Column-based sorting (click column headers)
 * - SINTA breakdown tooltip on hover
 * - Responsive horizontal scroll
 */
export default function FacultyTable({ data }: FacultyTableProps) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('total_journals');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Handle column header click for sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Sort indicator arrow
    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="ml-1 text-muted-foreground/40">↕</span>;
        return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    // Filtered and sorted data
    const filteredData = useMemo(() => {
        let result = data;

        // Apply search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (item) =>
                    item.university_name.toLowerCase().includes(q) ||
                    (item.university_short_name && item.university_short_name.toLowerCase().includes(q)),
            );
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }

            const numA = Number(aVal) || 0;
            const numB = Number(bVal) || 0;
            return sortDirection === 'asc' ? numA - numB : numB - numA;
        });

        return result;
    }, [data, search, sortField, sortDirection]);

    // Summary totals
    const totals = useMemo(
        () => ({
            users: data.reduce((sum, d) => sum + d.total_users, 0),
            journals: data.reduce((sum, d) => sum + d.total_journals, 0),
            scopus: data.reduce((sum, d) => sum + d.scopus_indexed, 0),
            sinta: data.reduce((sum, d) => sum + d.total_sinta, 0),
        }),
        [data],
    );

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Rekap Performa Fakultas
                    </CardTitle>
                    <CardDescription>Belum ada data universitas yang tersedia.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Rekap Performa Fakultas
                        </CardTitle>
                        <CardDescription>
                            {data.length} universitas — {totals.journals} jurnal — {totals.scopus} Scopus — {totals.sinta} SINTA
                        </CardDescription>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="faculty-search"
                            type="text"
                            placeholder="Cari universitas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('university_name')}
                                >
                                    Universitas
                                    <SortIndicator field="university_name" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('total_users')}
                                >
                                    Pengelola
                                    <SortIndicator field="total_users" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('total_journals')}
                                >
                                    Jurnal
                                    <SortIndicator field="total_journals" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('scopus_indexed')}
                                >
                                    Scopus
                                    <SortIndicator field="scopus_indexed" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('total_sinta')}
                                >
                                    SINTA
                                    <SortIndicator field="total_sinta" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('average_score')}
                                >
                                    Rata-rata Skor
                                    <SortIndicator field="average_score" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('assessment_completion_rate')}
                                >
                                    Asesmen (%)
                                    <SortIndicator field="assessment_completion_rate" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item, index) => (
                                <tr key={item.university_id} className="transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{item.university_name}</div>
                                        {item.university_short_name && (
                                            <div className="text-xs text-muted-foreground">{item.university_short_name}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">{item.total_users}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-semibold">{item.total_journals}</span>
                                        {item.pending_journals > 0 && (
                                            <span className="ml-1 text-xs text-amber-500">({item.pending_journals} pending)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                item.scopus_indexed > 0
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {item.scopus_indexed}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="group relative inline-block">
                                            <span
                                                className={`inline-flex min-w-[2rem] cursor-help justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    item.total_sinta > 0
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                {item.total_sinta}
                                            </span>
                                            {/* SINTA breakdown tooltip */}
                                            {item.total_sinta > 0 && (
                                                <div className="invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg border bg-popover p-3 text-xs shadow-lg group-hover:visible">
                                                    <div className="mb-1 font-semibold">Detail SINTA</div>
                                                    {Object.entries(item.sinta_breakdown)
                                                        .filter(([key, val]) => key !== 'non_sinta' && val > 0)
                                                        .map(([key, val]) => (
                                                            <div key={key} className="flex justify-between gap-4">
                                                                <span>{key.replace('_', ' ').toUpperCase()}</span>
                                                                <span className="font-semibold">{val}</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.average_score > 0 ? (
                                            <span className="font-semibold">{item.average_score.toFixed(1)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all"
                                                    style={{ width: `${Math.min(item.assessment_completion_rate, 100)}%` }}
                                                />
                                            </div>
                                            <span className="min-w-[3rem] text-xs text-muted-foreground">
                                                {item.assessment_completion_rate.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada universitas yang cocok dengan pencarian &ldquo;{search}&rdquo;
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
