/**
 * PembinaanShow Component
 *
 * @description
 * Detail view page for a Pembinaan (Coaching/Training) program.
 * Shows program information, statistics, and paginated list of registrations.
 *
 * @route GET /admin/pembinaan/{id}
 *
 * @features
 * - Display program details (name, dates, quota, status)
 * - Show registration statistics
 * - Paginated registrations table with filters
 * - Actions: edit, toggle status, delete program
 * - View individual registration details
 *
 * @author JurnalMU Team
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Edit, Eye, Power, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AccreditationTemplate {
    id: number;
    name: string;
    type: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface University {
    id: number;
    name: string;
    short_name?: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    university: University;
    user: User;
}

interface Registration {
    id: number;
    journal: Journal;
    user: User;
    status: 'pending' | 'approved' | 'rejected';
    registered_at: string;
    reviewed_at?: string;
    reviewer?: User;
    rejection_reason?: string;
}

interface Pembinaan {
    id: number;
    name: string;
    description?: string;
    category: 'akreditasi' | 'indeksasi';
    status: 'draft' | 'active' | 'closed';
    accreditation_template?: AccreditationTemplate;
    registration_start: string;
    registration_end: string;
    assessment_start: string;
    assessment_end: string;
    quota?: number;
    registrations_count: number;
    pending_registrations_count: number;
    approved_registrations_count: number;
    creator?: User;
    created_at: string;
}

interface Props {
    pembinaan: Pembinaan;
    registrations: PaginatedData<Registration>;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function PembinaanShow({ pembinaan, registrations, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pembinaan',
            href: '/admin/pembinaan',
        },
        {
            title: pembinaan.name,
            href: route('admin.pembinaan.show', pembinaan.id),
        },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(route('admin.pembinaan.show', pembinaan.id), { search: value, status }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(route('admin.pembinaan.show', pembinaan.id), { search, status: value || undefined }, { preserveState: true, replace: true });
    };

    const handleToggleStatus = () => {
        const statusFlow = { draft: 'active', active: 'closed', closed: 'draft' };
        const nextStatus = statusFlow[pembinaan.status as keyof typeof statusFlow];

        router.post(
            route('admin.pembinaan.toggle-status', pembinaan.id),
            { status: nextStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Program status changed to ${nextStatus}`);
                },
                onError: () => {
                    toast.error('Failed to change status');
                },
            },
        );
    };

    const handleDelete = () => {
        router.delete(route('admin.pembinaan.destroy', pembinaan.id), {
            onSuccess: () => {
                toast.success('Program deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete program. It may have approved registrations.');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            active: 'default',
            closed: 'outline',
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status as keyof typeof variants] as any}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pembinaan.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 space-y-4">
                        <Button variant="ghost" size="sm" className="h-auto w-full justify-start gap-2 p-0 sm:w-auto" asChild>
                            <Link href={route('admin.pembinaan.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{pembinaan.name}</h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {pembinaan.category.charAt(0).toUpperCase() + pembinaan.category.slice(1)}
                                    {pembinaan.accreditation_template && ` • ${pembinaan.accreditation_template.name}`}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:mt-1">
                                {getStatusBadge(pembinaan.status)}
                                {pembinaan.category === 'akreditasi' && <Badge variant="outline">Akreditasi</Badge>}
                                {pembinaan.category === 'indeksasi' && <Badge variant="outline">Indeksasi</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={handleToggleStatus}>
                            <Power className="mr-2 h-4 w-4" />
                            Toggle Status
                        </Button>
                        <Button className="w-full sm:w-auto" asChild>
                            <Link href={route('admin.pembinaan.edit', pembinaan.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>

                    {/* Program Info Cards */}
                    {pembinaan.registrations_count > 0 ? (
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pembinaan.registrations_count}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{pembinaan.pending_registrations_count}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{pembinaan.approved_registrations_count}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Quota</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pembinaan.quota || '∞'}</div>
                                    {pembinaan.quota && (
                                        <p className="text-xs text-muted-foreground">
                                            {pembinaan.approved_registrations_count} / {pembinaan.quota} filled
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="mb-6 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mb-2 text-lg font-semibold">No Registrations Yet</h3>
                                <p className="mb-4 text-center text-sm text-muted-foreground">
                                    Waiting for journals to register for this program.
                                    <br />
                                    Make sure the program status is "Active" for registrations to be accepted.
                                </p>
                                {pembinaan.status !== 'active' && (
                                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                        <span>ℹ️</span>
                                        <span>
                                            Current status: <strong>{pembinaan.status}</strong>. Change to <strong>Active</strong> to accept
                                            registrations.
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Program Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Program Details</CardTitle>
                            <CardDescription>Overview of program schedule and configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {pembinaan.description && (
                                <div>
                                    <h3 className="mb-1 text-sm font-medium">Description</h3>
                                    <p className="text-sm text-muted-foreground">{pembinaan.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <CalendarDays className="h-4 w-4" />
                                        Registration Period
                                    </h3>
                                    <div className="rounded-lg border p-3 text-sm">
                                        <div>
                                            <span className="font-medium">Start:</span> {formatDateTime(pembinaan.registration_start)}
                                        </div>
                                        <div>
                                            <span className="font-medium">End:</span> {formatDateTime(pembinaan.registration_end)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <CalendarDays className="h-4 w-4" />
                                        Assessment Period
                                    </h3>
                                    <div className="rounded-lg border p-3 text-sm">
                                        <div>
                                            <span className="font-medium">Start:</span> {formatDateTime(pembinaan.assessment_start)}
                                        </div>
                                        <div>
                                            <span className="font-medium">End:</span> {formatDateTime(pembinaan.assessment_end)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {pembinaan.creator && (
                                <div className="border-t pt-4 text-sm text-muted-foreground">
                                    Created by {pembinaan.creator.name} on {formatDate(pembinaan.created_at)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Registrations Table */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Registrations</CardTitle>
                            <CardDescription>List of journals registered to this program</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Filters */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search journals..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={status || 'all'} onValueChange={(value) => handleStatusFilter(value === 'all' ? '' : value)}>
                                        <SelectTrigger className="w-full lg:w-48">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(search || status) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setSearch('');
                                                setStatus('');
                                                router.get(route('admin.pembinaan.show', pembinaan.id));
                                            }}
                                            className="w-full whitespace-nowrap lg:w-auto"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[800px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Journal</TableHead>
                                                <TableHead>University</TableHead>
                                                <TableHead>Pengelola</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Registered</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {registrations.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                            <Users className="mb-2 h-8 w-8" />
                                                            <p>No registrations found</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                registrations.data.map((registration) => (
                                                    <TableRow key={registration.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{registration.journal.title}</div>
                                                                <div className="text-sm text-muted-foreground">ISSN: {registration.journal.issn}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {registration.journal.university.short_name || registration.journal.university.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="text-sm">{registration.user.name}</div>
                                                                <div className="text-xs text-muted-foreground">{registration.user.email}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                                                        <TableCell className="text-sm">{formatDate(registration.registered_at)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-end">
                                                                <Button variant="ghost" size="icon" title="View Details">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {registrations.data.length > 0 && (
                                <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row sm:gap-0">
                                    <div className="text-center text-sm text-muted-foreground sm:text-left">
                                        Showing {registrations.from} to {registrations.to} of {registrations.total} registrations
                                    </div>
                                    <div className="flex gap-2">
                                        {registrations.prev_page_url && (
                                            <Button variant="outline" size="sm" onClick={() => router.get(registrations.prev_page_url!)}>
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        )}
                                        {registrations.next_page_url && (
                                            <Button variant="outline" size="sm" onClick={() => router.get(registrations.next_page_url!)}>
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The program will be soft deleted and can be restored later.
                            <br />
                            <br />
                            <strong>Note:</strong> Programs with approved registrations cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
