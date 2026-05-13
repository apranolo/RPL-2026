/**
 * UniversitiesShow Component
 *
 * @description
 * A specific detail view page for university (PTM) records.
 * This component displays comprehensive information about a university,
 * including its contact details, statistics, assigned users, and journals.
 *
 * @component
 *
 * @interface University
 * @property {number} id - Unique identifier
 * @property {string} code - University code
 * @property {string} name - Full name
 * @property {string} logo_url - URL to logo
 * @property {boolean} is_active - Activation status
 * @property {string} full_address - Formatted address
 * @property {string} phone - Contact phone
 * @property {string} email - Contact email
 * @property {string} website - Website URL
 * @property {string} created_at - Registration date
 * @property {string} updated_at - Last modification date
 * @property {number} users_count - Count of associated users
 * @property {number} journals_count - Count of associated journals
 *
 * @interface User
 * @property {number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role
 *
 * @interface Journal
 * @property {number} id - Journal ID
 * @property {string} title - Journal title
 * @property {string} issn - Journal ISSN
 *
 * @interface Props
 * @property {University} university - The university data
 * @property {User[]} users - List of users belonging to this university
 * @property {Journal[]} journals - List of journals belonging to this university
 * @property {Object} can - User permissions
 *
 * @route GET /admin/universities/{id}
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Universities/Show.tsx
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
// Table UI imports removed — not used in this file
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, Edit, Globe, Mail, MapPin, Phone, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface University {
    id: number;
    code: string;
    ptm_code?: string;
    name: string;
    short_name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    accreditation_status?: string;
    cluster?: string;
    profile_description?: string;
    is_active: boolean;
    full_address: string;
    created_at: string;
    updated_at: string;
    users_count: number;
    journals_count: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface Props {
    university: University;
    users: User[];
    journals: Journal[];
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function UniversitiesShow({ university, users, journals, can }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Universities',
            href: '/admin/universities',
        },
        {
            title: university.short_name || 'Details',
            href: `/admin/universities/${university.id}`,
        },
    ];

    const handleDelete = () => {
        router.delete(route('admin.universities.destroy', university.id), {
            onSuccess: () => {
                toast.success('University deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete university');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={university.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="mb-6">
                            <Link href={route('admin.universities.index')}>
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to List
                                </Button>
                            </Link>

                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                <div className="flex items-start gap-4">
                                    {university.logo_url && (
                                        <img
                                            src={university.logo_url}
                                            alt={university.name}
                                            className="h-20 w-20 rounded-lg border border-sidebar-border/70 bg-white object-contain dark:border-sidebar-border"
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">{university.name}</h1>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="border-sidebar-border/70 font-mono dark:border-sidebar-border">
                                                {university.code}
                                            </Badge>
                                            {university.ptm_code && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-200 bg-blue-50 font-mono text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                >
                                                    PTM: {university.ptm_code}
                                                </Badge>
                                            )}
                                            {university.accreditation_status && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-200 bg-purple-50 font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                                >
                                                    {university.accreditation_status}
                                                </Badge>
                                            )}
                                            {university.cluster && (
                                                <Badge variant="secondary" className="font-medium">
                                                    {university.cluster}
                                                </Badge>
                                            )}
                                            {university.is_active ? (
                                                <Badge className="border-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(can.update || can.delete) && (
                                    <div className="flex gap-2">
                                        {can.update && (
                                            <Link href={route('admin.universities.edit', university.id)}>
                                                <Button className="flex items-center gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        {can.delete && (
                                            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Info */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* University Profile */}
                            {university.profile_description && (
                                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                    <h2 className="mb-4 text-xl font-semibold text-foreground">Profile</h2>
                                    <p className="leading-relaxed text-foreground">{university.profile_description}</p>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Information</h2>
                                <div className="space-y-4">
                                    {university.full_address && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Address</div>
                                                <div className="mt-0.5 text-foreground">{university.full_address}</div>
                                            </div>
                                        </div>
                                    )}

                                    {university.phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                                <a
                                                    href={`tel:${university.phone}`}
                                                    className="mt-0.5 inline-block text-foreground hover:text-green-600 hover:underline"
                                                >
                                                    {university.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                                <a
                                                    href={`mailto:${university.email}`}
                                                    className="mt-0.5 inline-block text-foreground hover:text-green-600 hover:underline"
                                                >
                                                    {university.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.website && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Website</div>
                                                <a
                                                    href={university.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-0.5 inline-block text-foreground hover:text-green-600 hover:underline"
                                                >
                                                    {university.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Users */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    Users ({users.length})
                                </h2>
                                {users.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground italic">No users assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between rounded-lg border border-sidebar-border/50 bg-card p-3 transition-colors hover:bg-accent/50"
                                            >
                                                <div>
                                                    <div className="font-medium text-foreground">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Journals */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                                    <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    Journals ({journals.length})
                                </h2>
                                {journals.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground italic">No journals registered yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {journals.map((journal) => (
                                            <div
                                                key={journal.id}
                                                className="rounded-lg border border-sidebar-border/50 bg-card p-3 transition-colors hover:bg-accent/50"
                                            >
                                                <div className="font-medium text-foreground">{journal.title}</div>
                                                {journal.issn && <div className="mt-1 text-sm text-muted-foreground">ISSN: {journal.issn}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* University Info */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">University Info</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="mb-1 text-sm text-muted-foreground">University Code</div>
                                        <div className="font-mono text-base font-semibold text-foreground">{university.code}</div>
                                    </div>
                                    {university.ptm_code && (
                                        <div className="border-t border-sidebar-border/50 pt-3">
                                            <div className="mb-1 text-sm text-muted-foreground">PTM Code (PDDIKTI)</div>
                                            <div className="font-mono text-base font-semibold text-foreground">{university.ptm_code}</div>
                                        </div>
                                    )}
                                    {university.accreditation_status && (
                                        <div className="border-t border-sidebar-border/50 pt-3">
                                            <div className="mb-1 text-sm text-muted-foreground">Accreditation Status</div>
                                            <Badge
                                                variant="outline"
                                                className="mt-1 border-purple-200 bg-purple-50 font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                            >
                                                {university.accreditation_status}
                                            </Badge>
                                        </div>
                                    )}
                                    {university.cluster && (
                                        <div className="border-t border-sidebar-border/50 pt-3">
                                            <div className="mb-1 text-sm text-muted-foreground">Cluster</div>
                                            <Badge variant="secondary" className="mt-1 font-medium">
                                                {university.cluster}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-white p-2 text-green-600 shadow-sm dark:bg-black dark:text-green-400">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                                        </div>
                                        <span className="text-xl font-bold text-foreground">{university.users_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm dark:bg-black dark:text-amber-400">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Total Journals</span>
                                        </div>
                                        <span className="text-xl font-bold text-foreground">{university.journals_count}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">Metadata</h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="mb-1 text-muted-foreground">Created At</div>
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {university.created_at}
                                        </div>
                                    </div>
                                    <div className="border-t border-sidebar-border/50 pt-3">
                                        <div className="mb-1 text-muted-foreground">Last Updated</div>
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {university.updated_at}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete University</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{university.name}</strong>? This action cannot be undone and all associated data
                            (Admin Kampus, Pengelola Jurnal, and journals) will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
