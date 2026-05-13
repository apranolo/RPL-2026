/**
 * ScheduleIndex Component
 *
 * @description
 * List view for managing review schedules. Super Admin can view all
 * scheduled reviews, create new schedules, edit existing ones, and
 * manage review assignments.
 *
 * @route GET /admin/schedules
 *
 * @features
 * - Paginated list of review schedules
 * - Filter by status (scheduled/completed/cancelled)
 * - Search by journal title or reviewer name
 * - Quick actions (view, edit, delete)
 * - Status badges with color coding
 * - Upcoming schedule highlighting
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Edit, Eye, ExternalLink, MapPin, Plus, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Review Schedules', href: '/admin/schedules' },
];

interface ReviewSchedule {
    id: number;
    journal_assessment_id: number;
    reviewer_id: number;
    scheduled_at: string;
    ended_at?: string;
    location?: string;
    meeting_link?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    proposal?: {
        id: number;
        journal: { id: number; title: string; issn: string };
        user: { id: number; name: string };
    };
    reviewer?: { id: number; name: string; email: string };
    creator?: { id: number; name: string };
    created_at: string;
}

interface Props {
    schedules: PaginatedData<ReviewSchedule>;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function ScheduleIndex({ schedules, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('admin.schedules.index'),
            { search: value, status },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(
            route('admin.schedules.index'),
            { search, status: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (!deleteId) return;

        router.delete(route('admin.schedules.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Schedule deleted successfully');
                setDeleteId(null);
            },
            onError: () => {
                toast.error('Failed to delete schedule');
                setDeleteId(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            scheduled: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
        };
        return (
            <Badge variant={(variants[status] as any) || 'outline'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDateTime = (date: string) => {
        return format(new Date(date), 'EEEE, dd MMM yyyy HH:mm', { locale: id });
    };

    const formatDateOnly = (date: string) => {
        return format(new Date(date), 'dd MMM yyyy', { locale: id });
    };

    const isUpcoming = (scheduledAt: string) => {
        return new Date(scheduledAt) > new Date();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Review Schedules</h1>
                                <p className="mt-1 text-muted-foreground">Manage review scheduling for journal assessments</p>
                            </div>
                            <Button asChild className="flex items-center gap-2">
                                <Link href={route('admin.schedules.create')}>
                                    <Plus className="h-4 w-4" />
                                    Create Schedule
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by journal title or reviewer..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select
                                value={status || 'all'}
                                onValueChange={(value) => handleStatusFilter(value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            {(search || status) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setStatus('');
                                        router.get(route('admin.schedules.index'));
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead>Scheduled At</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <CalendarDays className="mb-2 h-8 w-8" />
                                                <p>No schedules found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schedules.data.map((schedule) => (
                                        <TableRow
                                            key={schedule.id}
                                            className={
                                                isUpcoming(schedule.scheduled_at) && schedule.status === 'scheduled'
                                                    ? 'border-l-2 border-l-primary'
                                                    : ''
                                            }
                                        >
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {schedule.proposal?.journal?.title || 'N/A'}
                                                    </div>
                                                    {schedule.proposal?.journal?.issn && (
                                                        <div className="text-xs text-muted-foreground">
                                                            ISSN: {schedule.proposal.journal.issn}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{schedule.reviewer?.name || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDateTime(schedule.scheduled_at)}</span>
                                                </div>
                                                {schedule.ended_at && (
                                                    <div className="text-xs text-muted-foreground">
                                                        until {formatDateTime(schedule.ended_at)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {schedule.location ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{schedule.location}</span>
                                                    </div>
                                                ) : schedule.meeting_link ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <ExternalLink className="h-3 w-3" />
                                                        <a
                                                            href={schedule.meeting_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            Online
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild title="View Details">
                                                        <Link href={route('admin.schedules.show', schedule.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild title="Edit Schedule">
                                                        <Link href={route('admin.schedules.edit', schedule.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteId(schedule.id)}
                                                        title="Delete Schedule"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-4 md:hidden">
                        {schedules.data.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 py-12 text-center text-muted-foreground">
                                    <CalendarDays className="mb-2 h-12 w-12" />
                                    <p>No schedules found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            schedules.data.map((schedule) => (
                                <Card
                                    key={schedule.id}
                                    className={
                                        isUpcoming(schedule.scheduled_at) && schedule.status === 'scheduled'
                                            ? 'border-l-2 border-l-primary'
                                            : ''
                                    }
                                >
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">{schedule.proposal?.journal?.title || 'N/A'}</div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    {schedule.reviewer?.name || 'N/A'}
                                                </div>
                                            </div>
                                            {getStatusBadge(schedule.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Date & Time</span>
                                                <div className="mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDateOnly(schedule.scheduled_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Location</span>
                                                <div className="mt-1">
                                                    {schedule.location || schedule.meeting_link ? (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {schedule.location || 'Online'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                                            <Button variant="ghost" size="icon" asChild title="View Details">
                                                <Link href={route('admin.schedules.show', schedule.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild title="Edit Schedule">
                                                <Link href={route('admin.schedules.edit', schedule.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(schedule.id)}
                                                title="Delete Schedule"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {schedules.data.length > 0 && (
                        <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Total: <span className="font-medium">{schedules.total}</span> schedule{schedules.total !== 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-2">
                                {schedules.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(schedules.prev_page_url!)}>
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                )}
                                {schedules.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(schedules.next_page_url!)}>
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The schedule will be soft deleted and can be restored later.
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
