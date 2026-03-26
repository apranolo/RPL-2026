/**
 * JournalsIndex Component
 *
 * @description
 * The main journal management dashboard for users. It displays a comprehensive list
 * of journals that the user is responsible for with search, filters, and approval status.
 *
 * @features
 * - List view with search and filters
 * - Approval status indicators
 * - Assessment quick actions
 * - Pagination with info
 * - Delete functionality
 *
 * @route GET /user/journals
 */
import SintaBadge from '@/components/badges/SintaBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Edit, ExternalLink, Eye, FileText, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface Assessment {
    id: number;
    status: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    university: {
        name: string;
    };
    scientific_field: {
        name: string;
    };
    sinta_rank: string | null;
    sinta_rank_label: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    approval_status_label: string;
    rejection_reason: string | null;
    is_active: boolean;
    created_at: string;
    latest_assessment: Assessment | null;
}

interface ScientificField {
    id: number;
    name: string;
}

interface Filters {
    search: string;
    sinta_rank: string;
    scientific_field_id: string;
    approval_status: string;
}

interface Props {
    journals: {
        data: Journal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: Filters;
    scientificFields: ScientificField[];
}

export default function JournalsIndex({ journals, filters: initialFilters, scientificFields }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [filters, setFilters] = useState<Filters>(initialFilters || { search: '', sinta_rank: '', scientific_field_id: '', approval_status: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Journals', href: route('user.journals.index') },
    ];

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            router.delete(route('user.journals.destroy', id));
        }
    };

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('user.journals.index'),
            { ...filters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setFilters({ search: '', sinta_rank: '', scientific_field_id: '', approval_status: '' });
        router.get(route('user.journals.index'), {}, { preserveState: true });
    };

    const getApprovalStatusBadge = (status: 'pending' | 'approved' | 'rejected', label: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        };

        // Fallback labels if backend doesn't provide them (though they should be in $appends now)
        const displayLabel =
            label ||
            {
                pending: 'Pending Approval',
                approved: 'Approved',
                rejected: 'Rejected',
            }[status] ||
            status;

        return (
            <Badge variant="outline" className={cn('px-2 py-0.5 font-medium', colors[status])}>
                {displayLabel}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Journals" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    My Journals
                                </h1>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">Manage journals that you are responsible for</p>
                            </div>
                            <Link href={route('user.journals.create')} className="w-full sm:w-auto">
                                <Button className="flex w-full items-center justify-center gap-2 sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    Add New Journal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            {flash.error}
                        </div>
                    )}

                    {/* Search & Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by title, ISSN..."
                                            className="pl-10"
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Select
                                    value={filters.sinta_rank}
                                    onValueChange={(value) => setFilters({ ...filters, sinta_rank: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="SINTA Rank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ranks</SelectItem>
                                        <SelectItem value="sinta_1">SINTA 1</SelectItem>
                                        <SelectItem value="sinta_2">SINTA 2</SelectItem>
                                        <SelectItem value="sinta_3">SINTA 3</SelectItem>
                                        <SelectItem value="sinta_4">SINTA 4</SelectItem>
                                        <SelectItem value="sinta_5">SINTA 5</SelectItem>
                                        <SelectItem value="sinta_6">SINTA 6</SelectItem>
                                        <SelectItem value="non_sinta">Non SINTA</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.scientific_field_id}
                                    onValueChange={(value) => setFilters({ ...filters, scientific_field_id: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Scientific Field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Fields</SelectItem>
                                        {scientificFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id.toString()}>
                                                {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.approval_status}
                                    onValueChange={(value) => setFilters({ ...filters, approval_status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Approval Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm">
                                    <Search className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={handleClearFilters}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block dark:bg-gray-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal Info</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead>SINTA</TableHead>
                                    <TableHead>Approval Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No journals found.{' '}
                                            {filters.search || filters.sinta_rank || filters.scientific_field_id || filters.approval_status
                                                ? 'Try adjusting your filters.'
                                                : 'Click "Add New Journal" to start.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Link
                                                        href={route('user.journals.show', journal.id)}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                                    >
                                                        {journal.title}
                                                    </Link>
                                                    {journal.url && (
                                                        <a
                                                            href={journal.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Visit Website <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {journal.issn && <div>Print: {journal.issn}</div>}
                                                    {journal.e_issn && <div>Elec: {journal.e_issn}</div>}
                                                    {!journal.issn && !journal.e_issn && <span className="text-gray-400 dark:text-gray-500">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{journal.scientific_field?.name || '-'}</TableCell>
                                            <TableCell>
                                                <SintaBadge rank={journal.sinta_rank} />
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <div className="flex items-center gap-2">
                                                        {getApprovalStatusBadge(journal.approval_status, journal.approval_status_label)}
                                                        {journal.approval_status === 'rejected' && journal.rejection_reason && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertCircle className="h-4 w-4 cursor-help text-red-500 dark:text-red-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs">{journal.rejection_reason}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('user.journals.show', journal.id)}>
                                                        <Button variant="ghost" size="sm" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    {journal.latest_assessment ? (
                                                        <Link href={route('user.assessments.show', journal.latest_assessment.id)}>
                                                            <Button variant="outline" size="sm" title="View Assessment">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Link href={route('user.assessments.create', { journal_id: journal.id })}>
                                                            <Button variant="outline" size="sm" title="Create Assessment">
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}

                                                    <Link href={route('user.journals.edit', journal.id)}>
                                                        <Button variant="ghost" size="sm" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    {journal.approval_status !== 'approved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(journal.id, journal.title)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {journals.total > 0 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <div className="text-sm text-muted-foreground">
                                    Showing {journals.from} to {journals.to} of {journals.total} journals
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={journals.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                route('user.journals.index'),
                                                { ...filters, page: journals.current_page - 1 },
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <span className="text-sm">
                                        Page {journals.current_page} of {journals.last_page}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={journals.current_page === journals.last_page}
                                        onClick={() =>
                                            router.get(
                                                route('user.journals.index'),
                                                { ...filters, page: journals.current_page + 1 },
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card View (Mobile) */}
                    <div className="block space-y-4 md:hidden">
                        {journals.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No journals found.{' '}
                                    {filters.search || filters.sinta_rank || filters.scientific_field_id || filters.approval_status
                                        ? 'Try adjusting your filters.'
                                        : 'Click "Add New Journal" to start.'}
                                </CardContent>
                            </Card>
                        ) : (
                            journals.data.map((journal) => (
                                <Card key={journal.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex flex-col">
                                                <Link
                                                    href={route('user.journals.show', journal.id)}
                                                    className="font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                                >
                                                    {journal.title}
                                                </Link>
                                                {journal.url && (
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Visit Website <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <SintaBadge rank={journal.sinta_rank} />
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">ISSN</span>
                                                <span className="text-right">
                                                    {journal.issn && <span>Print: {journal.issn} </span>}
                                                    {journal.e_issn && <span>Elec: {journal.e_issn}</span>}
                                                    {!journal.issn && !journal.e_issn && <span className="text-gray-400 dark:text-gray-500">-</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Scientific Field</span>
                                                <span className="text-right">{journal.scientific_field?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-2 dark:border-sidebar-border">
                                                <span className="text-muted-foreground">Status</span>
                                                <TooltipProvider>
                                                    <div className="flex items-center gap-2">
                                                        {getApprovalStatusBadge(journal.approval_status, journal.approval_status_label)}
                                                        {journal.approval_status === 'rejected' && journal.rejection_reason && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertCircle className="h-4 w-4 cursor-help text-red-500 dark:text-red-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs">{journal.rejection_reason}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-3 dark:border-sidebar-border">
                                            <Link href={route('user.journals.show', journal.id)} className="flex-1 sm:flex-none">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </Button>
                                            </Link>

                                            {journal.latest_assessment ? (
                                                <Link
                                                    href={route('user.assessments.show', journal.latest_assessment.id)}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <FileText className="mr-2 h-4 w-4" /> Assessment
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('user.assessments.create', { journal_id: journal.id })}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Plus className="mr-2 h-4 w-4" /> Assessment
                                                    </Button>
                                                </Link>
                                            )}

                                            <Link href={route('user.journals.edit', journal.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            {journal.approval_status !== 'approved' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(journal.id, journal.title)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {/* Mobile Pagination */}
                        {journals.total > 0 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm">
                                <div className="w-full text-center text-muted-foreground">
                                    Showing {journals.from} to {journals.to} of {journals.total} journals
                                </div>
                                <div className="flex w-full justify-between gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={journals.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                route('user.journals.index'),
                                                { ...filters, page: journals.current_page - 1 },
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        className="flex-1"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={journals.current_page === journals.last_page}
                                        onClick={() =>
                                            router.get(
                                                route('user.journals.index'),
                                                { ...filters, page: journals.current_page + 1 },
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        className="flex-1"
                                    >
                                        Next
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
