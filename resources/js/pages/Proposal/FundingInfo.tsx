import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, Download, FileText } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';

type FundingStatus = 'planned' | 'requested' | 'approved' | 'disbursed' | 'cancelled';

interface Funding {
    id: number;
    funding_number: string;
    description: string | null;
    amount: number;
    percentage: number;
    status: FundingStatus;
    status_label: string;
    status_color: string;
    funding_date: string | null;
    paid_at: string | null;
    reference_number: string | null;
    proof_document_path: string | null;
    notes: string | null;
}

interface Contract {
    id: number;
    contract_number: string;
    title: string | null;
    start_date: string | null;
    contract_value: number;
    status: string;
    status_label: string;
    total_disbursed: number;
    remaining_funding: number;
    disbursement_percentage: number;
    fundings: Funding[];
    created_at: string;
}

interface FundingStats {
    total_approved: number;
    total_disbursed: number;
    total_remaining: number;
    active_contracts: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    contracts: {
        data: Contract[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: PaginationLink[];
    };
    fundingStats: FundingStats;
    filters: {
        search: string;
    };
}

const StatusIcon = ({ status }: { status: FundingStatus }) => {
    switch (status) {
        case 'disbursed':
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'requested':
        case 'approved':
            return <Clock className="h-4 w-4 text-yellow-600" />;
        case 'cancelled':
            return <AlertCircle className="h-4 w-4 text-red-600" />;
        default:
            return null;
    }
};

const getStatusColor = (status: FundingStatus) => {
    switch (status) {
        case 'disbursed':
            return 'bg-green-100 text-green-800';
        case 'requested':
        case 'approved':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function FundingInfo({ contracts, fundingStats, filters: initialFilters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pendanaan', href: route('user.funding.index') },
    ];

    const toggleContractExpand = (contractId: number) => {
        const newExpanded = new Set(expandedContracts);
        if (newExpanded.has(contractId)) {
            newExpanded.delete(contractId);
        } else {
            newExpanded.add(contractId);
        }
        setExpandedContracts(newExpanded);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendanaan" />

            {/* Flash Messages */}
            {flash?.success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{flash.success}</div>}

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Rincian Dana Cair</h1>
                <p className="mt-2 text-gray-600">Kelola dan pantau pencairan dana penelitian Anda</p>
            </div>

            {/* Funding Statistics Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Total Approved Funding */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Dana Disetujui</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(fundingStats.total_approved)}</div>
                        <p className="mt-2 text-xs text-gray-500">Dari {fundingStats.active_contracts} kontrak aktif</p>
                    </CardContent>
                </Card>

                {/* Total Disbursed */}
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">Dana Yang Sudah Cair</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(fundingStats.total_disbursed)}</div>
                        <p className="mt-2 text-xs text-green-600">
                            {fundingStats.total_approved > 0 ? ((fundingStats.total_disbursed / fundingStats.total_approved) * 100).toFixed(1) : 0}%
                            dari total
                        </p>
                    </CardContent>
                </Card>

                {/* Remaining Funding */}
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-orange-700">Sisa Dana</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(fundingStats.total_remaining)}</div>
                        <p className="mt-2 text-xs text-orange-600">Menunggu pencairan</p>
                    </CardContent>
                </Card>

                {/* Active Contracts */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Kontrak Aktif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fundingStats.active_contracts}</div>
                        <p className="mt-2 text-xs text-gray-500">Sedang berjalan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
                {contracts.data.length > 0 ? (
                    contracts.data.map((contract) => (
                        <Card key={contract.id}>
                            {/* Contract Header */}
                            <div
                                className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-gray-50"
                                onClick={() => toggleContractExpand(contract.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{contract.contract_number}</h3>
                                            <p className="text-sm text-gray-500">
                                                {contract.title} • {contract.start_date ?? '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Summary */}
                                <div className="mr-4 flex items-center gap-6 text-right">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">Dana Disetujui</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(contract.contract_value)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">Sudah Cair</p>
                                        <p className="font-semibold text-green-600">{formatCurrency(contract.total_disbursed)}</p>
                                    </div>
                                    <div className="w-24">
                                        <p className="text-xs font-medium text-gray-600">Progress</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Progress value={contract.disbursement_percentage} className="h-2" />
                                            <span className="text-xs font-semibold text-gray-900">{contract.disbursement_percentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mr-4">
                                    <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>{contract.status_label}</Badge>
                                </div>

                                {/* Expand Icon */}
                                <div>
                                    {expandedContracts.has(contract.id) ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content - Fundings */}
                            {expandedContracts.has(contract.id) && (
                                <CardContent className="pt-6">
                                    <div>
                                        <h4 className="mb-4 font-semibold text-gray-900">Detail Termin Pencairan</h4>

                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-gray-200 hover:bg-transparent">
                                                        <TableHead className="text-xs font-semibold">Termin</TableHead>
                                                        <TableHead className="text-right text-xs font-semibold">Persentase</TableHead>
                                                        <TableHead className="text-right text-xs font-semibold">Nominal</TableHead>
                                                        <TableHead className="text-xs font-semibold">Status</TableHead>
                                                        <TableHead className="text-xs font-semibold">Tanggal Cair</TableHead>
                                                        <TableHead className="text-xs font-semibold">No. Referensi</TableHead>
                                                        <TableHead className="text-center text-xs font-semibold">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {contract.fundings.map((funding) => (
                                                        <TableRow key={funding.id} className="border-gray-100 hover:bg-gray-50">
                                                            <TableCell className="font-medium text-gray-900">{funding.funding_number}</TableCell>
                                                            <TableCell className="text-right text-gray-700">{funding.percentage}%</TableCell>
                                                            <TableCell className="text-right text-gray-700">
                                                                {formatCurrency(funding.amount)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <StatusIcon status={funding.status} />
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn('text-xs', getStatusColor(funding.status))}
                                                                    >
                                                                        {funding.status_label}
                                                                    </Badge>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-600">{funding.paid_at || '-'}</TableCell>
                                                            <TableCell className="text-sm text-gray-600">{funding.reference_number || '-'}</TableCell>
                                                            <TableCell className="text-center">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            {funding.proof_document_path ? (
                                                                                <Button variant="ghost" size="sm" asChild>
                                                                                    <a
                                                                                        href={`/storage/${funding.proof_document_path}`}
                                                                                        download
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                    >
                                                                                        <Download className="h-4 w-4" />
                                                                                    </a>
                                                                                </Button>
                                                                            ) : (
                                                                                <Button variant="ghost" size="sm" disabled>
                                                                                    <Download className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {funding.proof_document_path ? 'Download bukti' : 'Bukti tidak tersedia'}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Notes Section */}
                                        {contract.fundings.some((f) => f.notes) && (
                                            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                                                <h5 className="font-medium text-gray-900">Catatan</h5>
                                                {contract.fundings
                                                    .filter((f) => f.notes)
                                                    .map((funding) => (
                                                        <div key={funding.id} className="rounded bg-blue-50 p-2 text-sm text-blue-900">
                                                            <p className="font-medium">{funding.funding_number}:</p>
                                                            <p className="text-xs">{funding.notes}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Belum ada data kontrak</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Data kontrak dan pendanaan akan ditampilkan di sini setelah proposal Anda diterima.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
