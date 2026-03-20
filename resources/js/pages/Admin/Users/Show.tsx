/**
 * UsersShow Component for Super Admin
 *
 * @description
 * A detailed view page for displaying comprehensive information about a user (Pengelola Jurnal).
 * This component shows the user's profile, contact information, assigned university, managed journals,
 * reviewer status, statistics, and activity logs. It provides functionality to view, edit, and toggle
 * the active status of the user.
 *
 * @component
 *
 * @interface User
 * @property {number} id - Unique identifier for the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address
 * @property {string|null} phone - Phone number
 * @property {string|null} avatar_url - URL to the profile avatar image
 * @property {boolean} is_active - Account active status
 * @property {boolean} is_reviewer - Reviewer status (v1.1 feature)
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {string} university.city - City where university is located
 * @property {string} university.province - Province where university is located
 * @property {string|null} last_login_at - Timestamp of last login
 * @property {string} created_at - Account creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {number} journals_count - Number of journals managed by this user
 *
 * @interface Journal
 * @property {number} id - Unique identifier for the journal
 * @property {string} title - Journal title
 * @property {string} issn - International Standard Serial Number
 * @property {string|null} scientific_field - Scientific field/discipline of the journal
 * @property {string} created_at - Journal creation timestamp
 *
 * @interface Props
 * @property {User} user - The user data to display
 * @property {Journal[]} journals - Array of journals managed by this user
 *
 * @param {Props} props - Component props
 * @param {User} props.user - User details
 * @param {Journal[]} props.journals - List of managed journals
 *
 * @returns The rendered user detail page
 *
 * @example
 * ```tsx
 * <UsersShow
 *   user={userData}
 *   journals={journalsList}
 * />
 * ```
 *
 * @features
 * - Display user profile with avatar
 * - Show contact information (email, phone)
 * - Display assigned university details
 * - Show reviewer badge if is_reviewer=true
 * - List all managed journals in a table
 * - Show statistics (journals count)
 * - Display activity information (last login, created at, updated at)
 * - Toggle active/inactive status
 * - Navigate to edit page
 * - Breadcrumb navigation with User Management parent
 * - Dark mode support
 * - Blue color scheme
 *
 * @route GET /admin/users/{id}
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/components/ui/table
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Users/Show.tsx
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, BookOpen, Building2, Calendar, Edit, Mail, MapPin, Phone, Shield, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    is_reviewer: boolean;
    scientific_field: {
        id: number;
        name: string;
        code: string;
    } | null;
    university: {
        id: number;
        name: string;
        short_name: string;
        code: string;
        city: string;
        province: string;
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

interface Props {
    user: User;
    journals: Journal[];
}

export default function UsersShow({ user, journals }: Props) {
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
        {
            title: user.name,
            href: `/admin/users/${user.id}`,
        },
    ];

    const handleToggleActive = () => {
        router.post(
            route('admin.users.toggle-active', user.id),
            {},
            {
                onSuccess: () => {
                    toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to update user status');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
                            <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row">
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
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
                                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{user.name}</h1>
                                    </div>
                                    <p className="mt-1 text-muted-foreground">Pengelola Jurnal Details</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                            <UserCheck className="mr-1 h-3 w-3" />
                                            Pengelola Jurnal
                                        </Badge>
                                        {user.is_reviewer && (
                                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                                <Award className="mr-1 h-3 w-3" />
                                                Reviewer
                                            </Badge>
                                        )}
                                        {user.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full gap-2 sm:w-auto">
                                <Button className="flex-1 sm:flex-none" variant={user.is_active ? 'outline' : 'default'} onClick={handleToggleActive}>
                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={route('admin.users.edit', user.id)} className="flex-1 sm:flex-none">
                                    <Button className="flex w-full items-center justify-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Details */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Contact Information */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="text-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="text-foreground">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scientific Field Information */}
                            {user.scientific_field && (
                                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                    <h2 className="mb-4 text-xl font-semibold text-foreground">Scientific Field</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Bidang Ilmu</p>
                                                <p className="font-semibold text-foreground">
                                                    {user.scientific_field.code} - {user.scientific_field.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* University Information */}
                            {user.university && (
                                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                    <h2 className="mb-4 text-xl font-semibold text-foreground">University Assignment</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">University</p>
                                                <p className="font-semibold text-foreground">
                                                    {user.university.code} - {user.university.name}
                                                </p>
                                            </div>
                                        </div>
                                        {(user.university.city || user.university.province) && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Location</p>
                                                    <p className="text-foreground">
                                                        {user.university.city}, {user.university.province}
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
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[150px]">Journal Title</TableHead>
                                                    <TableHead className="min-w-[100px]">ISSN</TableHead>
                                                    <TableHead className="min-w-[150px]">Scientific Field</TableHead>
                                                    <TableHead className="min-w-[100px]">Created</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {journals.map((journal) => (
                                                    <TableRow key={journal.id}>
                                                        <TableCell className="font-medium">{journal.title}</TableCell>
                                                        <TableCell>{journal.issn}</TableCell>
                                                        <TableCell>{journal.scientific_field || '-'}</TableCell>
                                                        <TableCell>{new Date(journal.created_at).toLocaleDateString('id-ID')}</TableCell>
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
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Journals</p>
                                                <p className="text-2xl font-bold text-foreground">{user.journals_count}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity */}
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Activity</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Login</p>
                                            <p className="text-foreground">
                                                {user.last_login_at
                                                    ? new Date(user.last_login_at).toLocaleString('id-ID', {
                                                          dateStyle: 'medium',
                                                          timeStyle: 'short',
                                                      })
                                                    : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="text-foreground">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Updated At</p>
                                            <p className="text-foreground">
                                                {new Date(user.updated_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
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
