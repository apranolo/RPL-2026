/**
 * AdminKampusIndex Component
 *
 * @description
 * A comprehensive list view page for managing campus administrators (Admin Kampus) across all PTM universities.
 * This component provides filtering, searching, pagination, and CRUD operations for admin kampus accounts.
 * It displays admin information including their assigned university, contact details, journals count, and status.
 *
 * @component
 *
 * @interface AdminKampus
 * @property {number} id - Unique identifier for the admin kampus
 * @property {string} name - Full name of the admin kampus
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} position - Job position/title
 * @property {string|null} avatar_url - URL to the profile avatar image (optional)
 * @property {boolean} is_active - Account active status
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {number} journals_count - Number of journals managed by this admin
 * @property {string} last_login_at - Timestamp of last login
 * @property {string} created_at - Account creation timestamp
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated name
 * @property {string} code - University code
 *
 * @interface Props
 * @property {Object} adminKampus - Paginated admin kampus data
 * @property {AdminKampus[]} adminKampus.data - Array of admin kampus records
 * @property {number} adminKampus.current_page - Current page number
 * @property {number} adminKampus.last_page - Total number of pages
 * @property {number} adminKampus.per_page - Records per page
 * @property {number} adminKampus.total - Total number of records
 * @property {Array} adminKampus.links - Pagination links
 * @property {University[]} universities - Array of all universities for filtering
 * @property {Object} filters - Current filter values
 * @property {string} filters.search - Search query (name or email)
 * @property {string} filters.university_id - University filter ID
 * @property {string} filters.is_active - Active status filter
 *
 * @param {Props} props - Component props
 * @param {Object} props.adminKampus - Paginated admin kampus data
 * @param {University[]} props.universities - List of universities for filtering
 * @param {Object} props.filters - Current applied filters
 *
 * @returns The rendered admin kampus list page
 *
 * @example
 * ```tsx
 * <AdminKampusIndex
 *   adminKampus={paginatedData}
 *   universities={universitiesList}
 *   filters={{ search: '', university_id: '', is_active: '' }}
 * />
 * ```
 *
 * @features
 * - Search by name or email
 * - Filter by university assignment
 * - Filter by active/inactive status
 * - Paginated results with navigation
 * - View admin details
 * - Edit admin information
 * - Delete admin (with confirmation)
 * - Add new admin kampus button
 * - Flash messages for success/error feedback
 * - Responsive table layout
 * - Dark mode support
 * - Clear filters functionality
 *
 * @route GET /admin/admin-kampus
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/table
 * @requires @/components/ui/badge
 * @requires @/components/ui/select
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Index.tsx
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    EyeOff,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Admin Kampus',
        href: '/admin/admin-kampus',
    },
];

interface AdminKampus {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    avatar_url: string | null;
    is_active: boolean;
    university: {
        id: number;
        name: string;
        short_name: string;
        code: string;
    } | null;
    journals_count: number;
    last_login_at: string;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface PendingLppm {
    id: number;
    name: string;
    email: string;
    university: {
        id: number;
        name: string;
        short_name: string;
    } | null;
    created_at: string;
}

interface RejectedLppm {
    id: number;
    name: string;
    email: string;
    university: {
        id: number;
        name: string;
        short_name: string;
    } | null;
    rejection_reason: string;
    rejected_by: string;
    rejected_at: string;
    created_at: string;
}

interface Props {
    adminKampus: {
        data: AdminKampus[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    pendingLppm: {
        data: PendingLppm[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    rejectedLppm: {
        data: RejectedLppm[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    } | null;
    universities: University[];
    filters: {
        search: string;
        university_id: string;
        is_active: string;
        pending_lppm_search: string;
        rejected_lppm_search: string;
        show_rejected: boolean;
    };
}

export default function AdminKampusIndex({ adminKampus, pendingLppm, rejectedLppm, universities, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityId, setUniversityId] = useState(filters.university_id || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');
    const [pendingLppmSearch, setPendingLppmSearch] = useState(filters.pending_lppm_search || '');
    const [rejectedLppmSearch, setRejectedLppmSearch] = useState(filters.rejected_lppm_search || '');

    // LPPM Rejection dialog state
    const [selectedLppm, setSelectedLppm] = useState<PendingLppm | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.admin-kampus.index'),
            { search, university_id: universityId, is_active: isActiveFilter, pending_lppm_search: pendingLppmSearch },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) {
            router.delete(route('admin.admin-kampus.destroy', id));
        }
    };

    const handlePendingLppmSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.admin-kampus.index'),
            { search, university_id: universityId, is_active: isActiveFilter, pending_lppm_search: pendingLppmSearch },
            { preserveState: true },
        );
    };

    const handleApproveLppm = (lppm: PendingLppm) => {
        if (confirm(`Setujui pendaftaran LPPM Admin ${lppm.name}?`)) {
            router.post(
                route('admin.users.approve-lppm', lppm.id),
                {},
                {
                    preserveScroll: true,
                    onStart: () => setProcessing(true),
                    onFinish: () => setProcessing(false),
                },
            );
        }
    };

    const handleRejectLppm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedLppm || !rejectionReason.trim()) {
            return;
        }

        router.post(
            route('admin.users.reject-lppm', selectedLppm.id),
            { reason: rejectionReason },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setSelectedLppm(null);
                    setRejectionReason('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleRevertLppm = (lppm: RejectedLppm) => {
        if (confirm(`Revert rejection for ${lppm.name}? User akan kembali ke status pending.`)) {
            setProcessing(true);
            router.post(
                route('admin.users.revert-lppm', lppm.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setProcessing(false),
                },
            );
        }
    };

    const toggleRejectedView = () => {
        router.get(
            route('admin.admin-kampus.index'),
            {
                search,
                university_id: universityId,
                is_active: isActiveFilter,
                pending_lppm_search: pendingLppmSearch,
                rejected_lppm_search: rejectedLppmSearch,
                show_rejected: !filters.show_rejected,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Kampus Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    Admin Kampus Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">Manage university administrators across PTM</p>
                            </div>
                            <Link href={route('admin.admin-kampus.create')} className="w-full sm:w-auto">
                                <Button className="flex w-full items-center justify-center gap-2 sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    Add Admin Kampus
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                            {/* Search */}
                            <div className="relative w-full flex-1">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10"
                                />
                            </div>

                            {/* University Filter */}
                            <UniversityFilterCombobox
                                universities={universities}
                                value={universityId || 'all'}
                                onValueChange={(value) => setUniversityId(value === 'all' ? '' : value)}
                                placeholder="All Universities"
                                className="w-full md:w-64"
                            />

                            {/* Status Filter */}
                            <Select value={isActiveFilter || 'all'} onValueChange={(value) => setIsActiveFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                                <Button type="submit" className="w-full sm:w-auto">
                                    Search
                                </Button>
                                {(search || universityId || isActiveFilter) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            setSearch('');
                                            setUniversityId('');
                                            setIsActiveFilter('');
                                            router.get(route('admin.admin-kampus.index'));
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <Table className="min-w-[800px] md:min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admin Kampus</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="hidden text-center lg:table-cell">
                                        <BookOpen className="mr-1 inline h-4 w-4" />
                                        Journals
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adminKampus.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            No Admin Kampus found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adminKampus.data.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {admin.avatar_url ? (
                                                        <img src={admin.avatar_url} alt={admin.name} className="h-10 w-10 rounded-full" />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                                {admin.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-foreground">{admin.name}</div>
                                                        <div className="text-xs text-muted-foreground md:hidden">{admin.email}</div>
                                                        {admin.position && (
                                                            <div className="hidden text-sm text-muted-foreground md:block">{admin.position}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {admin.university ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">{admin.university.code}</div>
                                                        <div className="max-w-[150px] truncate text-sm text-muted-foreground md:max-w-none">
                                                            {admin.university.short_name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">
                                                    <div>{admin.email}</div>
                                                    {admin.phone && <div className="text-muted-foreground">{admin.phone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {admin.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/20">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-center lg:table-cell">{admin.journals_count}</TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="text-sm text-muted-foreground">{admin.last_login_at || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.admin-kampus.show', admin.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.admin-kampus.edit', admin.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(admin.id, admin.name)}>
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {adminKampus.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(adminKampus.current_page - 1) * adminKampus.per_page + 1} to{' '}
                                        {Math.min(adminKampus.current_page * adminKampus.per_page, adminKampus.total)} of {adminKampus.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {adminKampus.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === adminKampus.links.length - 1;

                                            return (
                                                <Link key={index} href={link.url} preserveState preserveScroll>
                                                    <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                                        {isFirst ? (
                                                            <ChevronLeft className="h-4 w-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        )}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pending LPPM Admin Registrations Section */}
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <UserPlus className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                                    Pending LPPM Admin Registrations
                                </h2>
                                <p className="mt-1 text-muted-foreground">Approve or reject LPPM Admin registrations from universities</p>
                            </div>
                            {pendingLppm.total > 0 && (
                                <Badge variant="outline" className="px-4 py-2 text-lg">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {pendingLppm.total} Pending
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Search for Pending LPPM */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handlePendingLppmSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search pending LPPM by name or email..."
                                        value={pendingLppmSearch}
                                        onChange={(e) => setPendingLppmSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit">Search</Button>
                            {filters.pending_lppm_search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setPendingLppmSearch('');
                                        router.get(route('admin.admin-kampus.index'), {
                                            search,
                                            university_id: universityId,
                                            is_active: isActiveFilter,
                                        });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Pending LPPM Table */}
                    <div className="overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead>Registration Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingLppm.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No pending LPPM Admin registrations.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingLppm.data.map((lppm) => (
                                        <TableRow key={lppm.id}>
                                            <TableCell className="font-medium">{lppm.name}</TableCell>
                                            <TableCell>{lppm.email}</TableCell>
                                            <TableCell>
                                                {lppm.university ? (
                                                    <div>
                                                        <div className="font-medium">{lppm.university.name}</div>
                                                        <div className="text-sm text-muted-foreground">{lppm.university.short_name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(lppm.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleApproveLppm(lppm)}
                                                        disabled={processing}
                                                        title="Approve LPPM Admin registration"
                                                    >
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedLppm(lppm);
                                                            setShowRejectDialog(true);
                                                        }}
                                                        disabled={processing}
                                                        title="Reject LPPM Admin registration"
                                                    >
                                                        <XCircle className="mr-1 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination for Pending LPPM */}
                        {pendingLppm.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(pendingLppm.current_page - 1) * pendingLppm.per_page + 1} to{' '}
                                        {Math.min(pendingLppm.current_page * pendingLppm.per_page, pendingLppm.total)} of {pendingLppm.total} pending
                                        LPPM
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pendingLppm.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === pendingLppm.links.length - 1;

                                            return (
                                                <Link key={index} href={link.url} preserveState preserveScroll>
                                                    <Button
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url || processing}
                                                    >
                                                        {isFirst ? (
                                                            <ChevronLeft className="h-4 w-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        )}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toggle Button for Rejected LPPM */}
            <div className="flex justify-end px-4">
                <Button variant={filters.show_rejected ? 'default' : 'outline'} onClick={toggleRejectedView} className="gap-2">
                    {filters.show_rejected ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {filters.show_rejected ? 'Hide' : 'Show'} Rejected LPPM
                    {rejectedLppm && (
                        <Badge variant="secondary" className="ml-2">
                            {rejectedLppm.total}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Rejected LPPM Section (conditional) */}
            {filters.show_rejected && rejectedLppm && (
                <div className="flex flex-col gap-4 rounded-xl p-4">
                    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-red-700 dark:text-red-400">
                                <XCircle className="h-7 w-7" />
                                Rejected LPPM Registrations
                            </h2>
                            <p className="mt-1 text-red-600 dark:text-red-400">View and revert rejected LPPM registrations</p>
                        </div>

                        {/* Search for Rejected LPPM */}
                        <div className="mb-6 rounded-lg border border-red-200 bg-white p-4 shadow-sm dark:border-red-900 dark:bg-neutral-950">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.get(
                                        route('admin.admin-kampus.index'),
                                        {
                                            search,
                                            university_id: universityId,
                                            is_active: isActiveFilter,
                                            pending_lppm_search: pendingLppmSearch,
                                            rejected_lppm_search: rejectedLppmSearch,
                                            show_rejected: true,
                                        },
                                        { preserveState: true },
                                    );
                                }}
                                className="flex gap-4"
                            >
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search rejected LPPM by name or email..."
                                            value={rejectedLppmSearch}
                                            onChange={(e) => setRejectedLppmSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Button type="submit">Search</Button>
                                {filters.rejected_lppm_search && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setRejectedLppmSearch('');
                                            router.get(route('admin.admin-kampus.index'), {
                                                search,
                                                university_id: universityId,
                                                is_active: isActiveFilter,
                                                pending_lppm_search: pendingLppmSearch,
                                                show_rejected: true,
                                            });
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </form>
                        </div>

                        {/* Rejected LPPM Table */}
                        <div className="overflow-x-auto rounded-lg border border-red-200 bg-white shadow-sm dark:border-red-900 dark:bg-neutral-950">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>University</TableHead>
                                        <TableHead>Rejection Reason</TableHead>
                                        <TableHead>Rejected By</TableHead>
                                        <TableHead>Rejected At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rejectedLppm.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No rejected LPPM Admin registrations.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rejectedLppm.data.map((lppm) => (
                                            <TableRow key={lppm.id}>
                                                <TableCell className="font-medium">{lppm.name}</TableCell>
                                                <TableCell>{lppm.email}</TableCell>
                                                <TableCell>
                                                    {lppm.university ? (
                                                        <div>
                                                            <div className="font-medium">{lppm.university.name}</div>
                                                            <div className="text-xs text-muted-foreground">{lppm.university.short_name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <p className="truncate text-sm text-muted-foreground" title={lppm.rejection_reason}>
                                                        {lppm.rejection_reason}
                                                    </p>
                                                </TableCell>
                                                <TableCell>{lppm.rejected_by}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(lppm.rejected_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRevertLppm(lppm)}
                                                        disabled={processing}
                                                        title="Revert rejection and move back to pending"
                                                    >
                                                        <RotateCcw className="mr-1 h-4 w-4" />
                                                        Revert
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination for Rejected LPPM */}
                            {rejectedLppm.last_page > 1 && (
                                <div className="border-t border-red-200 px-6 py-4 dark:border-red-900">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {(rejectedLppm.current_page - 1) * rejectedLppm.per_page + 1} to{' '}
                                            {Math.min(rejectedLppm.current_page * rejectedLppm.per_page, rejectedLppm.total)} of {rejectedLppm.total}{' '}
                                            rejected LPPM
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {rejectedLppm.links.map((link, index) => {
                                                if (link.url === null) return null;

                                                const isFirst = index === 0;
                                                const isLast = index === rejectedLppm.links.length - 1;

                                                return (
                                                    <Link key={index} href={link.url} preserveState preserveScroll>
                                                        <Button
                                                            variant={link.active ? 'default' : 'outline'}
                                                            size="sm"
                                                            disabled={!link.url || processing}
                                                        >
                                                            {isFirst ? (
                                                                <ChevronLeft className="h-4 w-4" />
                                                            ) : isLast ? (
                                                                <ChevronRight className="h-4 w-4" />
                                                            ) : (
                                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                            )}
                                                        </Button>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LPPM Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <form onSubmit={handleRejectLppm}>
                        <DialogHeader>
                            <DialogTitle>Reject LPPM Admin Registration</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting <span className="font-semibold">{selectedLppm?.name}</span>'s LPPM Admin registration.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Rejection Reason <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this LPPM registration is being rejected..."
                                    rows={4}
                                    required
                                    minLength={10}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 10 characters. The applicant will receive an email with this reason.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowRejectDialog(false);
                                    setRejectionReason('');
                                }}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={processing || rejectionReason.length < 10}>
                                {processing ? 'Rejecting...' : 'Reject LPPM Admin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
