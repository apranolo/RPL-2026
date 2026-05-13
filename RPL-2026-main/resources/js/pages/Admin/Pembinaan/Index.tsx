/**
 * PembinaanIndex Component
 *
 * @description
 * List view page for managing Pembinaan (Coaching/Training) programs.
 * Super Admin can view all programs with filters, create new programs,
 * edit existing ones, toggle status, and view registrations.
 *
 * @route GET /admin/pembinaan
 *
 * @features
 * - Paginated list of all pembinaan programs
 * - Filter by status (draft/active/closed)
 * - Filter by category (akreditasi/indeksasi)
 * - Search by program name
 * - Status badges with color coding
 * - Registration statistics
 * - Quick actions (view, edit, toggle status, delete)
 * - Soft delete support
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, Edit, Eye, FileText, Plus, Power, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pembinaan',
        href: '/admin/pembinaan',
    },
];

interface AccreditationTemplate {
    id: number;
    name: string;
    type: string;
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
    creator?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    pembinaan: PaginatedData<Pembinaan>;
    filters: {
        status?: string;
        category?: string;
        search?: string;
    };
}

export default function PembinaanIndex({ pembinaan, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(route('admin.pembinaan.index'), { search: value, status, category }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(route('admin.pembinaan.index'), { search, status: value || undefined, category }, { preserveState: true, replace: true });
    };

    const handleCategoryFilter = (value: string) => {
        setCategory(value);
        router.get(route('admin.pembinaan.index'), { search, status, category: value || undefined }, { preserveState: true, replace: true });
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        const statusFlow = { draft: 'active', active: 'closed', closed: 'draft' };
        const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];

        router.post(
            route('admin.pembinaan.toggle-status', id),
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
        if (!deleteId) return;

        router.delete(route('admin.pembinaan.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Program deleted successfully');
                setDeleteId(null);
            },
            onError: () => {
                toast.error('Failed to delete program');
                setDeleteId(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            active: 'default',
            closed: 'outline',
        };
        return <Badge variant={variants[status as keyof typeof variants] as any}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getCategoryBadge = (category: string) => {
        return (
            <Badge variant="outline" className="capitalize">
                {category}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembinaan Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Pembinaan Programs</h1>
                                <p className="mt-1 text-muted-foreground">Manage coaching and training programs</p>
                            </div>
                            <Button asChild className="flex items-center gap-2">
                                <Link href={route('admin.pembinaan.create')}>
                                    <Plus className="h-4 w-4" />
                                    Create Program
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <Select value={status || 'all'} onValueChange={(value) => handleStatusFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Category Filter */}
                            <Select value={category || 'all'} onValueChange={(value) => handleCategoryFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="akreditasi">Akreditasi</SelectItem>
                                    <SelectItem value="indeksasi">Indeksasi</SelectItem>
                                </SelectContent>
                            </Select>

                            {(search || status || category) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setStatus('');
                                        setCategory('');
                                        router.get(route('admin.pembinaan.index'));
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Programs Table - Desktop */}
                    <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Program Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Registration Period</TableHead>
                                    <TableHead className="text-center">Registrations</TableHead>
                                    <TableHead className="text-center">Quota</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pembinaan.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText className="mb-2 h-8 w-8" />
                                                <p>No programs found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pembinaan.data.map((program) => (
                                        <TableRow key={program.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{program.name}</div>
                                                    {program.accreditation_template && (
                                                        <div className="text-sm text-muted-foreground">{program.accreditation_template.name}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCategoryBadge(program.category)}</TableCell>
                                            <TableCell>{getStatusBadge(program.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CalendarDays className="h-3 w-3" />
                                                    <span>
                                                        {formatDate(program.registration_start)} - {formatDate(program.registration_end)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="text-sm font-medium">{program.approved_registrations_count}</div>
                                                    <div className="text-xs text-muted-foreground">{program.pending_registrations_count} pending</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{program.quota ? program.quota : '∞'}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild title="View Details">
                                                        <Link href={route('admin.pembinaan.show', program.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild title="Edit Program">
                                                        <Link href={route('admin.pembinaan.edit', program.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(program.id, program.status)}
                                                        title="Toggle Status"
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteId(program.id)}
                                                        title="Delete Program"
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

                    {/* Programs List - Mobile */}
                    <div className="space-y-4 md:hidden">
                        {pembinaan.data.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 py-12 text-center text-muted-foreground">
                                    <FileText className="mb-2 h-12 w-12" />
                                    <p>No programs found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            pembinaan.data.map((program) => (
                                <Card key={program.id} className="overflow-hidden">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">{program.name}</div>
                                                {program.accreditation_template && (
                                                    <div className="text-sm text-muted-foreground">{program.accreditation_template.name}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(program.status)}
                                                {getCategoryBadge(program.category)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Registration Period</span>
                                                <div className="mt-1 flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    <span>
                                                        {formatDate(program.registration_start)} - {formatDate(program.registration_end)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Quota</span>
                                                <div className="mt-1 font-medium">{program.quota ? program.quota : '∞'}</div>
                                            </div>
                                        </div>

                                        <div className="rounded-md border border-sidebar-border/50 bg-sidebar p-3">
                                            <div className="mb-1 text-center text-sm text-muted-foreground">Registrations</div>
                                            <div className="flex items-center justify-around">
                                                <div className="text-center">
                                                    <div className="font-medium">{program.approved_registrations_count}</div>
                                                    <div className="text-xs text-muted-foreground">approved</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-medium">{program.pending_registrations_count}</div>
                                                    <div className="text-xs text-muted-foreground">pending</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                                            <Button variant="ghost" size="icon" asChild title="View Details">
                                                <Link href={route('admin.pembinaan.show', program.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild title="Edit Program">
                                                <Link href={route('admin.pembinaan.edit', program.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleStatus(program.id, program.status)}
                                                title="Toggle Status"
                                            >
                                                <Power className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(program.id)} title="Delete Program">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pembinaan.data.length > 0 && (
                        <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Total: <span className="font-medium">{pembinaan.total}</span> program{pembinaan.total !== 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-2">
                                {pembinaan.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(pembinaan.prev_page_url!)}>
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                )}
                                {pembinaan.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(pembinaan.next_page_url!)}>
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The program will be soft deleted and can be restored later. Note: Programs with approved
                            registrations cannot be deleted.
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
