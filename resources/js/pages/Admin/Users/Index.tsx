/**
 * UsersIndex Component
 *
 * @description
 * A comprehensive list view page for managing Pengelola Jurnal (Journal Managers) across all PTM universities.
 * Super Admin can view, filter, and manage all User role accounts system-wide.
 * This component provides filtering, searching, pagination, and CRUD operations for User accounts.
 *
 * @component
 *
 * @interface User
 * @property {number} id - Unique identifier for the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string|null} avatar_url - URL to the profile avatar image (optional)
 * @property {boolean} is_active - Account active status
 * @property {boolean} is_reviewer - Reviewer status flag (v1.1 feature)
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {number} journals_count - Number of journals managed by this user
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
 * @property {Object} users - Paginated users data
 * @property {User[]} users.data - Array of user records
 * @property {number} users.current_page - Current page number
 * @property {number} users.last_page - Total number of pages
 * @property {number} users.per_page - Records per page
 * @property {number} users.total - Total number of records
 * @property {Array} users.links - Pagination links
 * @property {University[]} universities - Array of all universities for filtering
 * @property {Object} filters - Current filter values
 * @property {string} filters.search - Search query (name or email)
 * @property {string} filters.university_id - University filter ID
 * @property {string} filters.is_active - Active status filter
 * @property {string} filters.is_reviewer - Reviewer status filter
 *
 * @param {Props} props - Component props
 *
 * @returns The rendered users list page
 *
 * @features
 * - Search by name or email
 * - Filter by university assignment
 * - Filter by active/inactive status
 * - Filter by reviewer status
 * - Paginated results with navigation
 * - View user details
 * - Edit user information
 * - Delete user (with confirmation)
 * - Add new user button
 * - Flash messages for success/error feedback
 * - Responsive table layout
 * - Dark mode support
 * - Clear filters functionality
 * - Reviewer badge indicator
 *
 * @route GET /admin/users
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
 * @filepath /resources/js/pages/Admin/Users/Index.tsx
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
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'User Management',
        href: '#',
    },
    {
        title: 'Pengelola Jurnal',
        href: '/admin/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    is_active: boolean;
    is_reviewer: boolean;
    roles: Array<{
        id: number;
        name: string;
        display_name: string;
    }>;
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
    universities: University[];
    filters: {
        search: string;
        university_id: string;
        is_active: string;
        is_reviewer: string;
    };
}

export default function UsersIndex({ users, universities, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityId, setUniversityId] = useState(filters.university_id || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');
    const [isReviewerFilter, setIsReviewerFilter] = useState(filters.is_reviewer || '');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        userId?: number;
        userName?: string;
    }>({ open: false });

    // Show toast notifications from flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.users.index'),
            { search, university_id: universityId, is_active: isActiveFilter, is_reviewer: isReviewerFilter },
            { preserveState: true },
        );
    };

    const openDeleteDialog = (id: number, name: string) => {
        setDeleteDialog({ open: true, userId: id, userName: name });
    };

    const confirmDelete = () => {
        if (deleteDialog.userId) {
            router.delete(route('admin.users.destroy', deleteDialog.userId), {
                onSuccess: () => {
                    toast.success('Pengelola Jurnal deleted successfully');
                    setDeleteDialog({ open: false });
                },
                onError: () => {
                    toast.error('Failed to delete Pengelola Jurnal');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengelola Jurnal Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Pengelola Jurnal Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">Manage journal managers across all PTM universities</p>
                            </div>
                            <Link href={route('admin.users.create')} className="w-full sm:w-auto">
                                <Button className="flex w-full items-center justify-center gap-2 sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    Add Pengelola Jurnal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            {/* Search */}
                            <div className="w-full sm:flex-1">
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

                            {/* University Filter */}
                            <div className="w-full sm:w-auto">
                                <UniversityFilterCombobox
                                    universities={universities}
                                    value={universityId}
                                    onValueChange={setUniversityId}
                                    placeholder="All Universities"
                                    className="w-full sm:w-64"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={isActiveFilter || 'all'} onValueChange={(value) => setIsActiveFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Reviewer Filter */}
                            <Select value={isReviewerFilter || 'all'} onValueChange={(value) => setIsReviewerFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Reviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="1">Reviewer</SelectItem>
                                    <SelectItem value="0">Non-Reviewer</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex w-full gap-2 sm:w-auto">
                                <Button type="submit" className="flex-1 sm:flex-none">
                                    Search
                                </Button>
                                {(search || universityId || isActiveFilter || isReviewerFilter) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => {
                                            setSearch('');
                                            setUniversityId('');
                                            setIsActiveFilter('');
                                            setIsReviewerFilter('');
                                            router.get(route('admin.users.index'));
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pengelola Jurnal</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">
                                        <BookOpen className="mr-1 inline h-4 w-4" />
                                        Journals
                                    </TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
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
                                                        <div className="font-semibold text-foreground">{user.name}</div>
                                                        {user.roles && user.roles.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {user.roles.map((role) => (
                                                                    <Badge
                                                                        key={role.id}
                                                                        className="bg-blue-100 text-xs text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                    >
                                                                        {role.display_name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
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
                                            <TableCell>
                                                {user.university ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">{user.university.code}</div>
                                                        <div className="text-sm text-muted-foreground">{user.university.short_name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
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
                                            <TableCell className="text-center">{user.journals_count}</TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">{user.last_login_at || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.users.show', user.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.users.edit', user.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(user.id, user.name)}>
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Desktop */}
                        {users.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex items-center justify-between">
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

                    {/* Card View (Mobile) */}
                    <div className="block space-y-4 md:hidden">
                        {users.data.length === 0 ? (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardContent className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                                    <UserCheck className="h-12 w-12 opacity-20" />
                                    No users found.
                                </CardContent>
                            </Card>
                        ) : (
                            users.data.map((user) => (
                                <Card key={user.id} className="overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold break-all text-foreground">{user.name}</div>
                                                    <div className="text-xs break-all text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                            {user.is_active ? (
                                                <Badge className="ml-2 shrink-0 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/20">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="ml-2 shrink-0 bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {/* Roles */}
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pb-2">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role.id}
                                                            className="bg-blue-100 text-xs text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        >
                                                            {role.display_name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-between border-t border-sidebar-border/70 pt-2 dark:border-sidebar-border">
                                                <span className="text-muted-foreground">University</span>
                                                <span className="text-right">
                                                    {user.university ? (
                                                        <>
                                                            <div className="font-medium text-foreground">{user.university.code}</div>
                                                            <div className="text-xs text-muted-foreground">{user.university.short_name}</div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="flex items-center text-muted-foreground">
                                                    <BookOpen className="mr-1 inline h-4 w-4" />
                                                    Journals
                                                </span>
                                                <span className="font-medium">{user.journals_count}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Phone</span>
                                                    <span>{user.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Last Login</span>
                                                <span>{user.last_login_at || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2 border-t border-sidebar-border/70 pt-3 dark:border-sidebar-border">
                                            <Link href={route('admin.users.show', user.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.users.edit', user.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(user.id, user.name)}>
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {/* Pagination Mobile */}
                        {users.last_page > 1 && (
                            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                                <div className="text-muted-foreground">
                                    Page {users.current_page} of {users.last_page}
                                </div>
                                <div className="flex w-full justify-center gap-2">
                                    {users.links.map((link, index) => {
                                        if (link.url === null) return null;
                                        // Only show prev/next on mobile
                                        const isFirst = index === 0;
                                        const isLast = index === users.links.length - 1;
                                        if (!isFirst && !isLast && !link.active) return null;

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
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pengelola Jurnal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.userName}</strong>? This action cannot be undone and all associated
                            data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
