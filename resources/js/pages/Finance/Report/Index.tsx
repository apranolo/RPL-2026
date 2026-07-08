/**
 * @route GET /finance/reports
 * @features Monitoring administrasi keuangan berdasarkan kontrak hibah dan pencairan termin pendanaan.
 */
import { FilterBar } from '@/components/FilterBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface FinanceData {
    id: number;
    contract_title: string;
    university: string;
    contract_value: number;
    disbursed_total: number;
    remaining_balance: number;
    status: string;
    status_label: string;
    signed_at?: string;
}

interface Summary {
    total_contracts: number;
    total_contract_value: number;
    total_disbursed: number;
    remaining_balance: number;
    year: number;
    scheme: string;
    data: FinanceData[];
}

interface Filters {
    year: number;
    scheme: string;
}

interface Props {
    summary: Summary;
    filters: Filters;
}

export default function Index({ summary, filters }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'outline',
            active: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
        };

        return <Badge variant={variants[status] || 'outline'}>{label}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Laporan Keuangan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Monitoring Administrasi Keuangan</h1>
                    <p className="text-muted-foreground">Ringkasan kontrak hibah dan pencairan dana tahun {summary.year}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kontrak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_contracts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nilai Kontrak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_contract_value)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Dicairkan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_disbursed)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sisa Dana Kontrak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{formatCurrency(summary.remaining_balance)}</div>
                        </CardContent>
                    </Card>
                </div>

                <FilterBar currentYear={filters.year} currentScheme={filters.scheme} />

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Kontrak Hibah</CardTitle>
                        <CardDescription>Data kontrak hibah dengan rincian nilai kontrak dan pencairan termin pendanaan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul Kontrak</TableHead>
                                    <TableHead>Universitas Penerima Hibah</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Nilai Total Kontrak</TableHead>
                                    <TableHead className="text-right">Total Dana Dicairkan</TableHead>
                                    <TableHead className="text-right">Sisa Dana Kontrak</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.contract_title}</TableCell>
                                        <TableCell>{item.university}</TableCell>
                                        <TableCell>{getStatusBadge(item.status, item.status_label)}</TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(item.contract_value)}</TableCell>
                                        <TableCell className="text-right text-blue-600">{formatCurrency(item.disbursed_total)}</TableCell>
                                        <TableCell className="text-right text-amber-600">{formatCurrency(item.remaining_balance)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {summary.data.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">Tidak ada data kontrak untuk tahun {summary.year}</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
