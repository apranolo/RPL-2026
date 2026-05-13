/**
 * AdminKampus PembinaanIndex Component
 *
 * @description
 * List view for managing Pembinaan registrations from Admin Kampus's university.
 * Admin Kampus can view, filter, approve/reject registrations, and assign reviewers.
 *
 * @route GET /admin-kampus/pembinaan/akreditasi | GET /admin-kampus/pembinaan/indeksasi
 *
 * @features
 * - Paginated list of registrations from own university
 * - Filter by status (pending/approved/rejected)
 * - Filter by pembinaan program
 * - Search by journal name/ISSN
 * - Status badges with color coding
 * - Quick view action
 * - Category-filtered registrations (Akreditasi or Indeksasi)
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type PembinaanRegistration } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Award, ChevronLeft, ChevronRight, Eye, FileText, Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
    registrations: PaginatedData<PembinaanRegistration>;
    filters: {
        status?: string;
        pembinaan_id?: string;
        search?: string;
    };
    category: 'akreditasi' | 'indeksasi';
}

export default function PembinaanIndex({ registrations, filters, category }: Props) {
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pembinaan',
            href: '#',
        },
        {
            title: categoryLabel,
            href: `/admin-kampus/pembinaan/${category}`,
        },
    ];
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(route(`admin-kampus.pembinaan.${category}`), { search: value, status }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(route(`admin-kampus.pembinaan.${category}`), { search, status: value || undefined }, { preserveState: true, replace: true });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
            <Head title={`Pembinaan ${categoryLabel} Registrations`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Pembinaan {categoryLabel} Registrations
                                </h1>
                                <p className="mt-1 text-muted-foreground">Review and manage {category} journal registrations from your university</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by journal name or ISSN..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={status || 'all'} onValueChange={(value) => handleStatusFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 text-sm text-muted-foreground">
                        Showing {registrations.data.length > 0 ? (registrations.current_page - 1) * registrations.per_page + 1 : 0} to{' '}
                        {Math.min(registrations.current_page * registrations.per_page, registrations.total)} of {registrations.total} registrations
                    </div>

                    {/* Registrations Table - Desktop */}
                    <div className="hidden overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        {registrations.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Journal</TableHead>
                                        <TableHead>Pengelola</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registrations.data.map((registration) => (
                                        <TableRow key={registration.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{registration.pembinaan?.name}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{registration.pembinaan?.category}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{registration.journal?.title}</div>
                                                    <div className="text-sm text-muted-foreground">ISSN: {registration.journal?.issn}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{registration.user?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{registration.user?.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(registration.status)}</TableCell>
                                            <TableCell className="text-sm">{formatDate(registration.registered_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild title="View Details">
                                                        <Link href={route('admin-kampus.pembinaan.registrations.show', registration.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
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
                                        <TableHead>Program</TableHead>
                                        <TableHead>Journal</TableHead>
                                        <TableHead>Pengelola</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-12 w-12 text-muted-foreground/50" />
                                                <p className="font-medium text-muted-foreground">No registrations found</p>
                                                <p className="text-sm text-muted-foreground">No registrations match your current filters</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Registrations List - Mobile */}
                    <div className="space-y-4 md:hidden">
                        {registrations.data.length > 0 ? (
                            registrations.data.map((registration) => (
                                <Card key={registration.id} className="overflow-hidden">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">{registration.pembinaan?.name}</div>
                                                <div className="text-sm text-muted-foreground capitalize">{registration.pembinaan?.category}</div>
                                            </div>
                                            <div>{getStatusBadge(registration.status)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Journal</div>
                                            <div className="font-medium">{registration.journal?.title}</div>
                                            <div className="text-sm text-muted-foreground">ISSN: {registration.journal?.issn}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Pengelola</div>
                                            <div className="text-sm">{registration.user?.name}</div>
                                            <div className="text-xs text-muted-foreground">{registration.user?.email}</div>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-4">
                                            <div className="text-sm text-muted-foreground">{formatDate(registration.registered_at)}</div>
                                            <Button variant="ghost" size="icon" asChild title="View Details">
                                                <Link href={route('admin-kampus.pembinaan.registrations.show', registration.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 py-12 text-center">
                                    <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
                                    <p className="font-medium text-muted-foreground">No registrations found</p>
                                    <p className="text-sm text-muted-foreground">No registrations match your current filters</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Pagination */}
                    {registrations.last_page > 1 && (
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {registrations.current_page} of {registrations.last_page}
                            </div>
                            <div className="flex gap-2">
                                {registrations.links.map((link, index) => {
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
