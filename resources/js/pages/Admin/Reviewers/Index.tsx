/**
 * ReviewersIndex Component
 *
 * @description
 * Placeholder page for Reviewer Management feature (v1.1).
 * This page displays an "Under Construction" message informing users that
 * reviewer management functionality will be available in version 1.1 after
 * the database migration adds is_reviewer fields to the users table.
 *
 * @component
 *
 * @returns The rendered reviewer placeholder page
 *
 * @features
 * - Under construction message
 * - v1.1 feature notification
 * - Information about upcoming reviewer functionality
 * - Link back to dashboard
 * - Dark mode support
 * - Responsive layout
 *
 * @plannedFeatures
 * - View all reviewers across universities
 * - Filter by university, expertise, active status
 * - View reviewer profiles with expertise and bio
 * - Manage reviewer assignments and max coaching load
 * - Toggle reviewer status
 * - View coaching requests assigned to each reviewer
 *
 * @route GET /admin/reviewers
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Reviewers/Index.tsx
 */
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, Building, Clock, Search, UserCheck } from 'lucide-react';

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
        title: 'Reviewer',
        href: '/admin/reviewers',
    },
];

export default function ReviewersIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Management - Coming Soon" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Under Construction Banner */}
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                        <div className="mb-6 rounded-full bg-purple-100 p-6 dark:bg-purple-900/20">
                            <Award className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                        </div>

                        <h1 className="mb-3 text-4xl font-bold text-foreground">Reviewer Management</h1>

                        <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 dark:bg-amber-900/20">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <span className="font-semibold text-amber-800 dark:text-amber-200">Coming in Version 1.1</span>
                        </div>

                        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
                            The Reviewer Management feature is currently under development and will be available in version 1.1 of the system. This
                            feature requires database migration to add reviewer-specific fields to the users table.
                        </p>

                        {/* Planned Features */}
                        <div className="mb-8 w-full max-w-3xl rounded-lg border border-sidebar-border/70 bg-card p-6 text-left dark:border-sidebar-border">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                                <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                Planned Features
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                                        <Search className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">View & Filter Reviewers</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Browse all reviewers with filtering by university, expertise, and status
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                                        <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Manage Reviewer Status</h3>
                                        <p className="text-sm text-muted-foreground">Toggle reviewer permissions for users and set expertise areas</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">View Coaching Assignments</h3>
                                        <p className="text-sm text-muted-foreground">Track coaching requests assigned to each reviewer</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                                        <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">University-Wide Overview</h3>
                                        <p className="text-sm text-muted-foreground">
                                            View reviewers across all PTM universities from Super Admin panel
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Migration Note */}
                        <div className="mb-8 max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-800 dark:bg-blue-900/20">
                            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">Database Migration Required</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                The following fields will be added to the{' '}
                                <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">users</code> table:
                            </p>
                            <ul className="mt-2 list-inside list-disc text-sm text-blue-800 dark:text-blue-300">
                                <li>
                                    <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">is_reviewer</code> - Boolean flag for reviewer
                                    status
                                </li>
                                <li>
                                    <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">reviewer_expertise</code> - Areas of expertise
                                    (JSON)
                                </li>
                                <li>
                                    <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">reviewer_bio</code> - Reviewer biography
                                </li>
                                <li>
                                    <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">reviewer_is_active</code> - Active reviewer
                                    status
                                </li>
                                <li>
                                    <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">max_assignments</code> - Maximum coaching
                                    assignments
                                </li>
                            </ul>
                        </div>

                        {/* Action Button */}
                        <Link href={route('dashboard')}>
                            <Button size="lg">Back to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
