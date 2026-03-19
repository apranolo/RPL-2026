/**
 * UsersShow Component for Admin Kampus
 *
 * @description
 * A detailed view page for displaying comprehensive information about a user (Pengelola Jurnal).
 * Shows user profile, contact information, managed journals, and account timestamps/statistics.
 *
 * @features
 * - Display user profile with avatar
 * - Show contact information
 * - List all managed journals
 * - Display account timestamps and statistics (e.g., creation date, last login)
 * - Toggle active/inactive status
 * - Navigate to edit page
 *
 * @route GET /admin-kampus/users/{id}
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Briefcase,
    Building2,
    CalendarClock,
    CalendarPlus,
    Clock,
    Edit,
    Mail,
    Phone,
    Power,
    Shield,
    Trash2,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
    is_active: boolean;
    scientific_field: {
        id: number;
        name: string;
        code: string;
    } | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    journals_count: number;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    scientific_field: string | null;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
}

interface Props {
    user: User;
    journals: Journal[];
    university: University;
}

export default function UsersShow({ user, journals, university }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
            href: '/admin-kampus/users',
        },
        {
            title: user.name,
            href: `/admin-kampus/users/${user.id}`,
        },
    ];

    const handleToggleActive = () => {
        router.post(route('admin-kampus.users.toggle-active', user.id));
    };

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${user.name}?`)) {
            router.delete(route('admin-kampus.users.destroy', user.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="h-20 w-20 rounded-full" />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                                    <div className="mt-2 flex items-center gap-2">
                                        {user.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                                        )}
                                        <Badge variant="outline">User</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto mt-4 md:mt-0">
                                <Button
                                    variant="outline"
                                    onClick={handleToggleActive}
                                    className="flex items-center gap-2"
                                    aria-label={user.is_active ? 'Deactivate user' : 'Activate user'}
                                >
                                    <Power className="h-4 w-4" />
                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={route('admin-kampus.users.edit', user.id)}>
                                    <Button className="flex items-center gap-2" aria-label={`Edit user ${user.name}`}>
                                        <Edit className="h-4 w-4" />
                                        Edit User
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="flex items-center gap-2"
                                    disabled={user.journals_count > 0}
                                    title={user.journals_count > 0 ? 'Cannot delete user with journals' : 'Delete user'}
                                    aria-label={`Delete user ${user.name}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{user.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{user.position || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">University</p>
                                        <p className="font-medium">{university.name}</p>
                                    </div>
                                </div>
                                {user.scientific_field && (
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Scientific Field</p>
                                            <p className="font-medium">
                                                {user.scientific_field.code} - {user.scientific_field.name}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity & Stats */}
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Activity & Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Managed Journals</p>
                                        <p className="font-medium">{user.journals_count}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Login</p>
                                        <p className="font-medium">{user.last_login_at || 'Never'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CalendarPlus className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium">{user.created_at}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                        <p className="font-medium">{user.updated_at}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Managed Journals */}
                    <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 p-6 dark:border-sidebar-border">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <BookOpen className="h-5 w-5" />
                                Managed Journals
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>ISSN</TableHead>
                                        <TableHead>Scientific Field</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {journals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                No journals managed by this user.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        journals.map((journal) => (
                                            <TableRow key={journal.id}>
                                                <TableCell className="font-medium">{journal.title}</TableCell>
                                                <TableCell>{journal.issn}</TableCell>
                                                <TableCell>{journal.scientific_field || '-'}</TableCell>
                                                <TableCell>{journal.created_at}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
