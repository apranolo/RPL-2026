/**
 * @route GET /finance/reports
 * @features Display financial monitoring table, filter by year and scheme, show summary statistics
 */
import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/FilterBar';
import AppLayout from '@/layouts/app-layout';

interface FinanceData {
    id: number;
    journal_title: string;
    university: string;
    assessor: string;
    date: string;
    status: string;
    status_key: string;
    revenue: number;
    expenses: number;
    profit: number;
}

interface Summary {
    total_assessments: number;
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
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

    const getStatusBadge = (statusKey: string, label: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            draft: 'outline',
            submitted: 'secondary',
            reviewed: 'default',
        };

        return <Badge variant={variants[statusKey] || 'outline'}>{label}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Laporan Keuangan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Monitoring Administrasi Keuangan</h1>
                    <p className="text-muted-foreground">
                        Laporan keuangan assessment jurnal tahun {summary.year}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_assessments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(summary.total_revenue)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(summary.total_expenses)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.net_profit)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar */}
                <FilterBar currentYear={filters.year} currentScheme={filters.scheme} />

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Assessment Keuangan</CardTitle>
                        <CardDescription>
                            Data assessment jurnal dengan rincian keuangan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jurnal</TableHead>
                                    <TableHead>Universitas</TableHead>
                                    <TableHead>Assessor</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Pendapatan</TableHead>
                                    <TableHead className="text-right">Pengeluaran</TableHead>
                                    <TableHead className="text-right">Laba</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.journal_title}
                                        </TableCell>
                                        <TableCell>{item.university}</TableCell>
                                        <TableCell>{item.assessor}</TableCell>
                                        <TableCell>
                                            {new Date(item.date).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status_key, item.status)}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                            {formatCurrency(item.revenue)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {formatCurrency(item.expenses)}
                                        </TableCell>
                                        <TableCell className={`text-right ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(item.profit)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {summary.data.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                Tidak ada data assessment untuk tahun {summary.year}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}