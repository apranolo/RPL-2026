import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, JournalAssessment, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardCheck, Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Assessments Monitoring Index Page (Admin Kampus)
 *
 * @description Monitor and review journal assessments within university
 * @route GET /admin-kampus/assessments
 * @features View assessments, Filter by status, Review submissions
 */

interface Props {
    assessments: PaginatedData<JournalAssessment>;
    filters: {
        status?: string;
        search?: string;
        period?: string;
        year?: string;
        approval_status?: string;
    };
    availablePeriods?: string[];
    availableYears?: number[];
}

export default function AssessmentsIndex({ assessments, filters, availablePeriods = [], availableYears = [] }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [period, setPeriod] = useState(filters.period || 'all');
    const [year, setYear] = useState(filters.year || 'all');
    const [approvalStatus, setApprovalStatus] = useState(filters.approval_status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin-kampus.assessments.index') },
    ];

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            route('admin-kampus.assessments.index'),
            {
                search: value,
                status: status !== 'all' ? status : undefined,
                period: period !== 'all' ? period : undefined,
                year: year !== 'all' ? year : undefined,
                approval_status: approvalStatus !== 'all' ? approvalStatus : undefined,
            },
            { preserveState: true, replace: true },
        );
    }, 500);

    useEffect(() => {
        debouncedSearch(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            route('admin-kampus.assessments.index'),
            {
                status: value !== 'all' ? value : undefined,
                search,
                period: period !== 'all' ? period : undefined,
                year: year !== 'all' ? year : undefined,
                approval_status: approvalStatus !== 'all' ? approvalStatus : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        router.get(
            route('admin-kampus.assessments.index'),
            {
                period: value !== 'all' ? value : undefined,
                status: status !== 'all' ? status : undefined,
                search,
                year: year !== 'all' ? year : undefined,
                approval_status: approvalStatus !== 'all' ? approvalStatus : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleYearChange = (value: string) => {
        setYear(value);
        router.get(
            route('admin-kampus.assessments.index'),
            {
                year: value !== 'all' ? value : undefined,
                status: status !== 'all' ? status : undefined,
                search,
                period: period !== 'all' ? period : undefined,
                approval_status: approvalStatus !== 'all' ? approvalStatus : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleApprovalStatusChange = (value: string) => {
        setApprovalStatus(value);
        router.get(
            route('admin-kampus.assessments.index'),
            {
                approval_status: value !== 'all' ? value : undefined,
                status: status !== 'all' ? status : undefined,
                search,
                period: period !== 'all' ? period : undefined,
                year: year !== 'all' ? year : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'secondary',
            submitted: 'default',
            reviewed: 'outline',
        };

        const labels: Record<string, string> = {
            draft: 'Draft',
            submitted: 'Submitted',
            reviewed: 'Reviewed',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assessment Monitoring" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <ClipboardCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Assessment Monitoring
                                </h1>
                                <p className="mt-1 text-muted-foreground">Monitor and review assessments from your university</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="space-y-4">
                            {/* First Row - Search and Status */}
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by journal title or ISSN..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9"
                                    />
                                </div>
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="reviewed">Reviewed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Second Row - Additional Filters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Select value={period} onValueChange={handlePeriodChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Periods</SelectItem>
                                        {availablePeriods.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={year} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {availableYears.map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={approvalStatus} onValueChange={handleApprovalStatusChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Approval status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Approval Status</SelectItem>
                                        <SelectItem value="pending">Pending Approval</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 text-sm text-muted-foreground">
                        Showing {assessments.data.length > 0 ? (assessments.current_page - 1) * assessments.per_page + 1 : 0} to{' '}
                        {Math.min(assessments.current_page * assessments.per_page, assessments.total)} of {assessments.total} assessments
                    </div>

                    {/* Assessments Mobile View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {assessments.data.length > 0 ? (
                            assessments.data.map((assessment) => (
                                <Card key={assessment.id}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium">{assessment.journal.title}</CardTitle>
                                        <div className="text-sm text-muted-foreground">ISSN: {assessment.journal.issn}</div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Pengelola:</span>
                                                <span className="font-medium text-foreground">{assessment.user.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <span>{getStatusBadge(assessment.status)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Submitted:</span>
                                                <span>{assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 pt-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('admin-kampus.assessments.show', assessment.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        {assessment.status === 'submitted' && (
                                            <Button size="sm" asChild>
                                                <Link href={route('admin-kampus.assessments.review', assessment.id)}>
                                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                                    Review
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-8">
                                    <ClipboardCheck className="mb-2 h-12 w-12 text-muted-foreground/50" />
                                    <p className="font-medium text-muted-foreground">No assessments found</p>
                                    <p className="text-center text-sm text-muted-foreground">No assessments match your current filters</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Assessments Table Desktop */}
                    <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        {assessments.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Journal</TableHead>
                                        <TableHead>Pengelola</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assessments.data.map((assessment) => (
                                        <TableRow key={assessment.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{assessment.journal.title}</p>
                                                    <p className="text-sm text-muted-foreground">ISSN: {assessment.journal.issn}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{assessment.user.name}</TableCell>
                                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                                            <TableCell>
                                                {assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin-kampus.assessments.show', assessment.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    {assessment.status === 'submitted' && (
                                                        <Button size="sm" asChild>
                                                            <Link href={route('admin-kampus.assessments.review', assessment.id)}>
                                                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                                                Review
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Journal</TableHead>
                                        <TableHead>Pengelola</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardCheck className="h-12 w-12 text-muted-foreground/50" />
                                                <p className="font-medium text-muted-foreground">No assessments found</p>
                                                <p className="text-sm text-muted-foreground">No assessments match your current filters</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Pagination */}
                    {assessments.last_page > 1 && (
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="text-sm text-muted-foreground">
                                Page {assessments.current_page} of {assessments.last_page}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {assessments.links.map((link, index) => {
                                    if (link.label === '&laquo; Previous') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        );
                                    }
                                    if (link.label === 'Next &raquo;') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    return (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            className={`hidden h-8 w-8 p-0 sm:flex ${link.active ? 'flex' : ''}`}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
