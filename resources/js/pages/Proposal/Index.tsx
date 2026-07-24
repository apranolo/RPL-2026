/**
 * Proposal/Index — Dosen
 *
 * @description
 * Halaman daftar proposal penelitian milik dosen terautentikasi.
 *
 * @features
 * - Daftar proposal dosen dengan pencarian & filter status
 * - Status badge (Draft, Submitted, Administrasi Valid, Ditolak)
 * - Navigasi ke halaman Buat Proposal Baru dan Detail/Edit Proposal
 * - Aksi hapus proposal (pemilik)
 *
 * @route GET /proposal
 */

import ActionButtons from '@/components/ActionButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proposal Penelitian', href: route('proposal.index') },
];

interface ProposalItem {
    id: number;
    title: string;
    description: string;
    status_proposal: string;
    file_dokumen_proposal?: string | null;
    research_schema?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
}

interface IndexProps {
    proposals: {
        data: ProposalItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Index({ proposals, filters }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('proposal.index'),
            {
                search,
                status: statusFilter === 'all' ? '' : statusFilter,
            },
            { preserveState: true }
        );
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        router.get(
            route('proposal.index'),
            {
                search,
                status: val === 'all' ? '' : val,
            },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus proposal ini?')) {
            router.delete(route('proposal.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Administrasi_Valid':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Valid Administrasi</Badge>;
            case 'Submitted':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Submitted</Badge>;
            case 'Ditolak':
                return <Badge variant="destructive">Ditolak</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proposal Penelitian Saya" />

            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Proposal Penelitian Saya</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola pengajuan proposal penelitian Anda dalam sistem.
                        </p>
                    </div>
                    <Link href={route('proposal.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajukan Proposal Baru
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari judul proposal..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Administrasi_Valid">Valid Administrasi</SelectItem>
                                    <SelectItem value="Ditolak">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                        </form>

                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul Proposal</TableHead>
                                        <TableHead>Skema Penelitian</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proposals.data && proposals.data.length > 0 ? (
                                        proposals.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium max-w-md">
                                                    <div className="line-clamp-2">{item.title}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.research_schema?.name || 'Belum dipilih'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(item.status_proposal)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link href={route('proposal.show', item.id)}>
                                                            <Button size="icon" variant="ghost" title="Detail">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('proposal.edit', item.id)}>
                                                            <Button size="icon" variant="ghost" title="Edit">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Belum ada proposal penelitian yang diajukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
