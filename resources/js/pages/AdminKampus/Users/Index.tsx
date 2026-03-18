/**
 * UsersIndex Component for Admin Kampus
 *
 * @description
 * A comprehensive list view page for managing users within the admin's university.
 * This component provides filtering, searching, pagination, and CRUD operations for user accounts.
 * Supports multi-role display and filtering.
 *
 * @features
 * - Search by name or email
 * - Filter by role
 * - Filter by active/inactive status
 * - Display user roles as badges
 * - Paginated results with navigation
 * - View, Edit, Delete user actions
 * - Toggle active status
 * - Add new user button
 * - Flash messages for success/error feedback
 *
 * @route GET /admin-kampus/users
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
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
    Power,
    RotateCcw,
    Search,
    Trash2,
    UserPlus,
    Users as UsersIcon,
    XCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin-kampus/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
    is_active: boolean;
    approval_status?: 'pending' | 'approved' | 'rejected'; // Approval workflow status
    rejection_reason?: string | null; // Reason if rejected
    roles: Array<{
        id: number;
        name: string;
        display_name: string;
    }>;
    journals_count: number;
    last_login_at: string | null;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface PendingUser {
    id: number;
    name: string;
    email: string;
    role?: {
        id: number;
        name: string;
        display_name: string;
    };
    created_at: string;
}

interface RejectedUser {
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
}

interface Props {
    users: {
        data: User[];
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
    pendingUsers: {
        data: PendingUser[];
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
    rejectedUsers: {
        data: RejectedUser[];
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
    university: University;
    roles: Role[];
    filters: {
        search: string;
        is_active: string;
        role_id: string;
        pending_search: string;
        rejected_search: string;
        approval_status: string;
        show_rejected: boolean;
    };
}

export default function UsersIndex({ users, pendingUsers, rejectedUsers, university, roles, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [pendingSearch, setPendingSearch] = useState(filters.pending_search || '');
    const [rejectedSearch, setRejectedSearch] = useState(filters.rejected_search || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');
    const [roleIdFilter, setRoleIdFilter] = useState(filters.role_id || '');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState(filters.approval_status || 'approved');

    // Rejection dialog state
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin-kampus.users.index'),
            { search, is_active: isActiveFilter, role_id: roleIdFilter, pending_search: pendingSearch, approval_status: approvalStatusFilter },
            { preserveState: true },
        );
    };

    const handlePendingSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin-kampus.users.index'),
            { search, is_active: isActiveFilter, role_id: roleIdFilter, pending_search: pendingSearch, approval_status: approvalStatusFilter },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) {
            router.delete(route('admin-kampus.users.destroy', id));
        }
    };

    const handleToggleActive = (id: number) => {
        router.post(route('admin-kampus.users.toggle-active', id));
    };

    const handleApprove = (user: PendingUser) => {
        if (confirm(`Setujui pendaftaran ${user.name}?`)) {
            router.post(
                route('admin-kampus.users.approve', user.id),
                {},
                {
                    preserveScroll: true,
                    onStart: () => setProcessing(true),
                    onFinish: () => setProcessing(false),
                },
            );
        }
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();

        if (!selectedUser || !rejectionReason.trim()) {
            return;
        }

        router.post(
            route('admin-kampus.users.reject', selectedUser.id),
            { reason: rejectionReason },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setSelectedUser(null);
                    setRejectionReason('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleRevert = (user: RejectedUser) => {
        if (confirm(`Revert rejection for ${user.name}? User akan kembali ke status pending.`)) {
            router.post(
                route('admin-kampus.users.revert', user.id),
                {},
                {
                    preserveScroll: true,
                    onStart: () => setProcessing(true),
                    onFinish: () => setProcessing(false),
                },
            );
        }
    };

    const toggleRejectedView = () => {
        router.get(
            route('admin-kampus.users.index'),
            {
                search,
                is_active: isActiveFilter,
                role_id: roleIdFilter,
                pending_search: pendingSearch,
                rejected_search: rejectedSearch,
                approval_status: approvalStatusFilter,
                show_rejected: !filters.show_rejected,
            },
            { preserveState: true },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    User Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">Manage users (Pengelola Jurnal) for {university.name}</p>
                            </div>
                            <Link href={route('admin-kampus.users.create')} className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create User
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
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <Select value={roleIdFilter || 'all'} onValueChange={(value) => setRoleIdFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Approval Status Filter */}
                            <Select value={approvalStatusFilter} onValueChange={(value) => setApprovalStatusFilter(value)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Approval Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="approved">Approved Only</SelectItem>
                                    <SelectItem value="rejected">Rejected Only</SelectItem>
                                    <SelectItem value="all">All Users</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Active Status Filter */}
                            <Select value={isActiveFilter || 'all'} onValueChange={(value) => setIsActiveFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Active Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Button type="submit" className="w-full sm:w-auto">Search</Button>
                                {(search || isActiveFilter || roleIdFilter || approvalStatusFilter !== 'approved') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            setSearch('');
                                            setIsActiveFilter('');
                                            setRoleIdFilter('');
                                            setApprovalStatusFilter('approved');
                                            router.get(route('admin-kampus.users.index'));
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead className="hidden md:table-cell">Roles</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="hidden text-center md:table-cell">
                                        <BookOpen className="mr-1 inline h-4 w-4" />
                                        Journals
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full" />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-foreground">{user.name}</span>
                                                            {user.approval_status === 'rejected' && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Rejected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {user.position && <div className="text-sm text-muted-foreground">{user.position}</div>}
                                                        {user.approval_status === 'rejected' && user.rejection_reason && (
                                                            <div
                                                                className="mt-1 max-w-xs truncate text-xs text-red-600 dark:text-red-400"
                                                                title={user.rejection_reason}
                                                            >
                                                                Reason: {user.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs">
                                                                {role.display_name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No roles</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">
                                                    <div>{user.email}</div>
                                                    {user.phone && <div className="text-muted-foreground">{user.phone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {user.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/20">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-center md:table-cell">{user.journals_count}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm text-muted-foreground">{user.last_login_at || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin-kampus.users.show', user.id)}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="View Details"
                                                            aria-label={`View details for ${user.name}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin-kampus.users.edit', user.id)}>
                                                        <Button variant="ghost" size="sm" title="Edit User" aria-label={`Edit ${user.name}`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user.id)}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                        aria-label={user.is_active ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                                                    >
                                                        <Power
                                                            className={`h-4 w-4 ${user.is_active ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        title="Delete User"
                                                        aria-label={`Delete ${user.name}`}
                                                    >
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
                        {users.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(users.current_page - 1) * users.per_page + 1} to{' '}
                                        {Math.min(users.current_page * users.per_page, users.total)} of {users.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {users.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === users.links.length - 1;

                                            return (
                                                <Link key={index} href={link.url} preserveState preserveScroll>
                                                    <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                                        {isFirst ? (
                                                            <ChevronLeft className="h-4 w-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <span>{link.label}</span>
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

            {/* Pending User Approvals Section */}
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <UserPlus className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                                    Pending User Approvals
                                </h2>
                                <p className="mt-1 text-muted-foreground">Approve or reject user registrations</p>
                            </div>
                            {pendingUsers.total > 0 && (
                                <Badge variant="outline" className="px-4 py-2 text-lg">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {pendingUsers.total} Pending
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Search for Pending Users */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handlePendingSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search pending users by name or email..."
                                        value={pendingSearch}
                                        onChange={(e) => setPendingSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit">Search</Button>
                            {filters.pending_search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setPendingSearch('');
                                        router.get(route('admin-kampus.users.index'), {
                                            search,
                                            is_active: isActiveFilter,
                                            role_id: roleIdFilter,
                                            approval_status: approvalStatusFilter,
                                        });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Pending Users Table */}
                    <div className="overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Registration Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingUsers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No pending user registrations.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingUsers.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="outline">{user.role?.display_name || 'Pending'}</Badge>
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{formatDate(user.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleApprove(user)}
                                                        disabled={processing}
                                                        title="Approve registration"
                                                    >
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowRejectDialog(true);
                                                        }}
                                                        disabled={processing}
                                                        title="Reject registration"
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

                        {/* Pagination for Pending Users */}
                        {pendingUsers.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(pendingUsers.current_page - 1) * pendingUsers.per_page + 1} to{' '}
                                        {Math.min(pendingUsers.current_page * pendingUsers.per_page, pendingUsers.total)} of {pendingUsers.total}{' '}
                                        pending users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pendingUsers.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === pendingUsers.links.length - 1;

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
                                                            <span>{link.label}</span>
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

            {/* Toggle Button for Rejected Users */}
            <div className="flex justify-end px-4">
                <Button variant={filters.show_rejected ? 'default' : 'outline'} onClick={toggleRejectedView} className="gap-2">
                    {filters.show_rejected ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {filters.show_rejected ? 'Hide' : 'Show'} Rejected Users
                    {rejectedUsers && (
                        <Badge variant="secondary" className="ml-2">
                            {rejectedUsers.total}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Rejected Users Section (conditional) */}
            {filters.show_rejected && rejectedUsers && (
                <div className="flex flex-col gap-4 rounded-xl p-4">
                    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-red-700 dark:text-red-400">
                                <XCircle className="h-7 w-7" />
                                Rejected User Registrations
                            </h2>
                            <p className="mt-1 text-red-600 dark:text-red-400">View and revert rejected user registrations</p>
                        </div>

                        {/* Search for Rejected Users */}
                        <div className="mb-6 rounded-lg border border-red-200 bg-white p-4 shadow-sm dark:border-red-900 dark:bg-neutral-950">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.get(
                                        route('admin-kampus.users.index'),
                                        {
                                            search,
                                            is_active: isActiveFilter,
                                            role_id: roleIdFilter,
                                            pending_search: pendingSearch,
                                            rejected_search: rejectedSearch,
                                            approval_status: approvalStatusFilter,
                                            show_rejected: true,
                                        },
                                        { preserveState: true },
                                    );
                                }}
                                className="flex flex-col gap-3 md:flex-row md:items-center"
                            >
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search rejected users by name or email..."
                                            value={rejectedSearch}
                                            onChange={(e) => setRejectedSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Button type="submit">Search</Button>
                                {filters.rejected_search && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setRejectedSearch('');
                                            router.get(route('admin-kampus.users.index'), {
                                                search,
                                                is_active: isActiveFilter,
                                                role_id: roleIdFilter,
                                                pending_search: pendingSearch,
                                                approval_status: approvalStatusFilter,
                                                show_rejected: true,
                                            });
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </form>
                        </div>

                        {/* Rejected Users Table */}
                        <div className="overflow-x-auto rounded-lg border border-red-200 bg-white shadow-sm dark:border-red-900 dark:bg-neutral-950">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden lg:table-cell">University</TableHead>
                                        <TableHead className="hidden md:table-cell">Rejection Reason</TableHead>
                                        <TableHead className="hidden lg:table-cell">Rejected By</TableHead>
                                        <TableHead className="hidden md:table-cell">Rejected At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rejectedUsers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No rejected user registrations.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rejectedUsers.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {user.university ? (
                                                        <div>
                                                            <div className="font-medium">{user.university.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.university.short_name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-md hidden md:table-cell">
                                                    <p className="truncate text-sm text-muted-foreground" title={user.rejection_reason}>
                                                        {user.rejection_reason}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">{user.rejected_by}</TableCell>
                                                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{formatDate(user.rejected_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRevert(user)}
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

                            {/* Pagination for Rejected Users */}
                            {rejectedUsers.last_page > 1 && (
                                <div className="border-t border-red-200 px-6 py-4 dark:border-red-900">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {(rejectedUsers.current_page - 1) * rejectedUsers.per_page + 1} to{' '}
                                            {Math.min(rejectedUsers.current_page * rejectedUsers.per_page, rejectedUsers.total)} of{' '}
                                            {rejectedUsers.total} rejected users
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {rejectedUsers.links.map((link, index) => {
                                                if (link.url === null) return null;

                                                const isFirst = index === 0;
                                                const isLast = index === rejectedUsers.links.length - 1;

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

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <form onSubmit={handleReject}>
                        <DialogHeader>
                            <DialogTitle>Reject User Registration</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting <span className="font-semibold">{selectedUser?.name}</span>'s registration.
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
                                    placeholder="Explain why this registration is being rejected..."
                                    rows={4}
                                    required
                                    minLength={10}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 10 characters. The user will receive an email with this reason.
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
                                {processing ? 'Rejecting...' : 'Reject User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
