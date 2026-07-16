/**
 * @file FacultyTable.tsx
 * @description Komponen tabel untuk menampilkan rekap performa jumlah proposal dan luaran per Fakultas/Prodi.
 * @module Dashboard/Reporting
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * Faculty performance statistics shape (Modul 6 Kelas B).
 * Matches the data returned by DashboardController::getFacultyStat()
 */
export interface FacultyStat {
    faculty_name: string;
    submitted: number;
    accepted: number;
}

interface FacultyTableProps {
    /** Array of faculty statistics from getFacultyStat() */
    data: FacultyStat[];
}

type SortField = 'faculty_name' | 'submitted' | 'accepted';
type SortDirection = 'asc' | 'desc';

/**
 * FacultyTable — Tabel rekap performa Fakultas/Prodi pada Admin Dashboard.
 *
 * Menampilkan:
 * - Jumlah proposal yang diajukan (submitted)
 * - Jumlah luaran yang disetujui (accepted)
 *
 * Features:
 * - Filter pencarian berdasarkan nama fakultas
 * - Sorting per kolom (klik header)
 * - Responsive dengan horizontal scroll
 */
export default function FacultyTable({ data }: FacultyTableProps) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('submitted');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="ml-1 text-muted-foreground/40">↕</span>;
        return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const filteredData = useMemo(() => {
        let result = data;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((item) => item.faculty_name.toLowerCase().includes(q));
        }

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

    const totals = useMemo(
        () => ({
            submitted: data.reduce((sum, d) => sum + d.submitted, 0),
            accepted: data.reduce((sum, d) => sum + d.accepted, 0),
        }),
        [data],
    );

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Rekap Performa Fakultas/Prodi
                    </CardTitle>
                    <CardDescription>Belum ada data fakultas yang tersedia.</CardDescription>
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
                            Rekap Performa Fakultas/Prodi
                        </CardTitle>
                        <CardDescription>
                            {data.length} Fakultas/Prodi — {totals.submitted} Proposal Diajukan — {totals.accepted} Luaran Disetujui
                        </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="faculty-search"
                            type="text"
                            placeholder="Cari fakultas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[500px] text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="w-14 px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('faculty_name')}
                                >
                                    Fakultas / Program Studi
                                    <SortIndicator field="faculty_name" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('submitted')}
                                >
                                    Proposal Diajukan
                                    <SortIndicator field="submitted" />
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => handleSort('accepted')}
                                >
                                    Luaran Disetujui
                                    <SortIndicator field="accepted" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item, index) => (
                                <tr key={item.faculty_name} className="transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium">{item.faculty_name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{item.submitted}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.accepted}</span>
                                    </td>
                                </tr>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada fakultas yang cocok dengan pencarian &ldquo;{search}&rdquo;
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
