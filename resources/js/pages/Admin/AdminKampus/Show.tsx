/**
 * AdminKampusShow Component
 *
 * @description
 * A detailed view page for displaying comprehensive information about a campus administrator (Admin Kampus).
 * This component shows the admin's profile, contact information, assigned university, managed journals,
 * statistics, and activity logs. It provides functionality to view, edit, and toggle the active status
 * of the admin kampus.
 *
 * @component
 *
 * @interface AdminKampus
 * @property {number} id - Unique identifier for the admin kampus
 * @property {string} name - Full name of the admin kampus
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} position - Job position/title
 * @property {string} avatar_url - URL to the profile avatar image
 * @property {boolean} is_active - Account active status
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {string} university.city - City where university is located
 * @property {string} university.province - Province where university is located
 * @property {string} last_login_at - Timestamp of last login
 * @property {string} created_at - Account creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {number} journals_count - Number of journals managed by this admin
 * @property {number} managed_users_count - Number of users under this admin's management
 *
 * @interface Journal
 * @property {number} id - Unique identifier for the journal
 * @property {string} title - Journal title
 * @property {string} issn - International Standard Serial Number
 * @property {string} scientific_field - Scientific field/discipline of the journal
 *
 * @interface Props
 * @property {AdminKampus} adminKampus - The admin kampus data to display
 * @property {Journal[]} journals - Array of journals managed by this admin
 *
 * @param {Props} props - Component props
 * @param {AdminKampus} props.adminKampus - Admin kampus details
 * @param {Journal[]} props.journals - List of managed journals
 *
 * @returns The rendered admin kampus detail page
 *
 * @example
 * ```tsx
 * <AdminKampusShow
 *   adminKampus={adminKampusData}
 *   journals={journalsList}
 * />
 * ```
 *
 * @features
 * - Display admin kampus profile with avatar
 * - Show contact information (email, phone, position)
 * - Display assigned university details
 * - List all managed journals in a table
 * - Show statistics (journals count, managed users count)
 * - Display activity information (last login, created at, updated at)
 * - Toggle active/inactive status
 * - Navigate to edit page
 * - Breadcrumb navigation
 * - Dark mode support
 *
 * @route GET /admin/admin-kampus/{id}
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/components/ui/table
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Show.tsx
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Briefcase, Building2, Calendar, Edit, Mail, MapPin, Phone, Shield, Users } from 'lucide-react';

interface AdminKampus {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    avatar_url: string;
    is_active: boolean;
    university: {
        id: number;
        name: string;
        short_name: string;
        code: string;
        city: string;
        province: string;
    } | null;
    last_login_at: string;
    created_at: string;
    updated_at: string;
    journals_count: number;
    managed_users_count: number;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    scientific_field: string;
}

interface Props {
    adminKampus: AdminKampus;
    journals: Journal[];
}

export default function AdminKampusShow({ adminKampus, journals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Admin Kampus',
            href: '/admin/admin-kampus',
        },
        {
            title: adminKampus.name,
            href: `/admin/admin-kampus/${adminKampus.id}`,
        },
    ];

    const handleToggleActive = () => {
        router.post(route('admin.admin-kampus.toggle-active', adminKampus.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={adminKampus.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.admin-kampus.index')}>
                            <Button variant="ghost" className="mb-4 w-full justify-start sm:w-auto">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                {adminKampus.avatar_url ? (
                                    <img src={adminKampus.avatar_url} alt={adminKampus.name} className="h-20 w-20 shrink-0 rounded-full" />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {adminKampus.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col items-center sm:items-start">
                                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{adminKampus.name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                            <Shield className="mr-1 h-3 w-3" />
                                            Admin Kampus
                                        </Badge>
                                        {adminKampus.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                <Button
                                    className="w-full sm:w-auto"
                                    variant={adminKampus.is_active ? 'outline' : 'default'}
                                    onClick={handleToggleActive}
                                >
                                    {adminKampus.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button className="w-full sm:w-auto" asChild>
                                    <Link href={route('admin.admin-kampus.edit', adminKampus.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Left Column - Details */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Contact Information */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex w-full items-center gap-3 overflow-hidden">
                                        <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="truncate text-foreground">{adminKampus.email}</p>
                                        </div>
                                    </div>
                                    {adminKampus.phone && (
                                        <div className="flex w-full items-center gap-3 overflow-hidden">
                                            <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="truncate text-foreground">{adminKampus.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {adminKampus.position && (
                                        <div className="flex w-full items-center gap-3 overflow-hidden">
                                            <Briefcase className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-muted-foreground">Position</p>
                                                <p className="truncate text-foreground">{adminKampus.position}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* University Information */}
                            {adminKampus.university && (
                                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                    <h2 className="mb-4 text-xl font-semibold text-foreground">University Assignment</h2>
                                    <div className="space-y-4">
                                        <div className="flex w-full items-center gap-3 overflow-hidden">
                                            <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-muted-foreground">University</p>
                                                <p className="truncate font-semibold text-foreground">
                                                    {adminKampus.university.code} - {adminKampus.university.name}
                                                </p>
                                            </div>
                                        </div>
                                        {(adminKampus.university.city || adminKampus.university.province) && (
                                            <div className="flex w-full items-center gap-3 overflow-hidden">
                                                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-muted-foreground">Location</p>
                                                    <p className="truncate text-foreground">
                                                        {adminKampus.university.city}, {adminKampus.university.province}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Managed Journals */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Managed Journals ({journals.length})</h2>
                                {journals.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">No journals managed yet</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[200px]">Journal Title</TableHead>
                                                    <TableHead className="min-w-[150px]">ISSN</TableHead>
                                                    <TableHead className="min-w-[200px]">Scientific Field</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {journals.map((journal) => (
                                                    <TableRow key={journal.id}>
                                                        <TableCell className="font-medium">{journal.title}</TableCell>
                                                        <TableCell>{journal.issn}</TableCell>
                                                        <TableCell>{journal.scientific_field || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Stats & Activity */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Journals</p>
                                                <p className="text-2xl font-bold text-foreground">{adminKampus.journals_count}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <div className="flex items-center gap-3">
                                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Managed Users</p>
                                                <p className="text-2xl font-bold text-foreground">{adminKampus.managed_users_count}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Activity</h2>
                                <div className="space-y-4">
                                    <div className="flex w-full items-center gap-3 overflow-hidden">
                                        <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-muted-foreground">Last Login</p>
                                            <p className="truncate text-foreground">{adminKampus.last_login_at || 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center gap-3 overflow-hidden">
                                        <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="truncate text-foreground">{adminKampus.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center gap-3 overflow-hidden">
                                        <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-muted-foreground">Updated At</p>
                                            <p className="truncate text-foreground">{adminKampus.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
