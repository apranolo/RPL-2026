import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, JournalAssessment, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardCheck, Eye, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Dikti Assessments Index Page
 *
 * @description Manage reviewer assignments for assessments approved by Admin Kampus
 * @route GET /dikti/assessments
 * @features View assessments pending assignment, Assign reviewers, Filter by status
 */

interface Props {
    assessments: PaginatedData<JournalAssessment>;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function DiktiAssessmentsIndex({ assessments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'pending_assignment');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reviewer Assignment', href: route('dikti.assessments.index') },
    ];

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            route('dikti.assessments.index'),
            { search: value, status: status !== 'all' ? status : undefined },
            { preserveState: true, replace: true },
        );
    }, 500);

    useEffect(() => {
        debouncedSearch(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(route('dikti.assessments.index'), { status: value !== 'all' ? value : undefined, search }, { preserveState: true, replace: true });
    };

    const getStatusBadge = (assessment: JournalAssessment) => {
        if (assessment.reviewer_id) {
            return <Badge variant="default">Reviewer Assigned</Badge>;
        }
        if (assessment.status === 'approved_by_lppm') {
            return <Badge variant="secondary">Pending Assignment</Badge>;
        }
        return <Badge variant="outline">{assessment.status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Assignment - Dikti" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
                                    <ClipboardCheck className="h-6 w-6 text-blue-600 md:h-8 md:w-8 dark:text-blue-400" />
                                    Reviewer Assignment
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                                    Assign reviewers to assessments approved by Admin Kampus (LPPM)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by journal title, ISSN, or university..."
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
                                        <SelectItem value="pending_assignment">Pending Assignment</SelectItem>
                                        <SelectItem value="assigned">Reviewer Assigned</SelectItem>
                                        <SelectItem value="approved_by_lppm">Approved by LPPM</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
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
                                                <span className="text-muted-foreground">University:</span>
                                                <span className="font-medium text-foreground">{assessment.journal.university?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Pengelola:</span>
                                                <span>{assessment.user.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Reviewer:</span>
                                                <span>
                                                    {assessment.reviewer ? (
                                                        <div className="text-right">
                                                            <p className="font-medium">{assessment.reviewer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{assessment.reviewer.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Not assigned</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <span>{getStatusBadge(assessment)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Approved Date:</span>
                                                <span>
                                                    {assessment.admin_kampus_approved_at
                                                        ? new Date(assessment.admin_kampus_approved_at).toLocaleDateString()
                                                        : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 pt-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('dikti.assessments.show', assessment.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        {!assessment.reviewer_id && (
                                            <Button size="sm" asChild>
                                                <Link href={route('dikti.assessments.show', assessment.id)}>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Assign
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
                                        <TableHead>University</TableHead>
                                        <TableHead>Pengelola</TableHead>
                                        <TableHead>Reviewer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Approved Date</TableHead>
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
                                            <TableCell>
                                                <div className="text-sm">{assessment.journal.university?.name || '-'}</div>
                                            </TableCell>
                                            <TableCell>{assessment.user.name}</TableCell>
                                            <TableCell>
                                                {assessment.reviewer ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium">{assessment.reviewer.name}</p>
                                                        <p className="text-xs text-muted-foreground">{assessment.reviewer.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(assessment)}</TableCell>
                                            <TableCell>
                                                {assessment.admin_kampus_approved_at
                                                    ? new Date(assessment.admin_kampus_approved_at).toLocaleDateString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('dikti.assessments.show', assessment.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    {!assessment.reviewer_id && (
                                                        <Button size="sm" asChild>
                                                            <Link href={route('dikti.assessments.show', assessment.id)}>
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Assign
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
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64">
                                            <div className="flex flex-col items-center justify-center space-y-3 py-8">
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
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
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
                                            className={`hidden h-8 w-8 p-0 md:flex ${link.active ? 'flex' : ''}`}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                        >
                                            {link.label}
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
