/**
 * AdminKampusCreate Component
 *
 * @description
 * A comprehensive form page for creating new campus administrator (Admin Kampus) accounts.
 * This component provides a multi-section form interface for entering admin information,
 * including personal details, account credentials, university assignment, and initial status.
 *
 * @component
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated university name
 * @property {string} code - University code
 *
 * @interface Props
 * @property {University[]} universities - Array of available universities for assignment
 *
 * @param {Props} props - Component props
 * @param {University[]} props.universities - List of universities to assign admin to
 *
 * @returns The rendered admin kampus creation form
 *
 * @example
 * ```tsx
 * <AdminKampusCreate
 *   universities={universitiesList}
 * />
 * ```
 *
 * @features
 * - Personal Information Section
 *   - Full name (required)
 *   - Email address (required, must be unique)
 *   - Phone number (optional)
 *   - Position/title (optional)
 * - Account Information Section
 *   - Password (required, minimum 8 characters)
 *   - Password confirmation (required, must match)
 * - University Assignment Section
 *   - Select university from dropdown (required)
 *   - Shows university code and name
 * - Status Section
 *   - Active/inactive checkbox toggle
 *   - Default: Active
 * - Form validation with error display
 * - Loading state during submission
 * - Cancel and submit buttons
 * - Breadcrumb navigation
 * - Dark mode support
 * - Responsive layout
 *
 * @formData
 * @property {string} name - Admin's full name
 * @property {string} email - Login email address
 * @property {string} password - Account password
 * @property {string} password_confirmation - Password confirmation
 * @property {string} phone - Contact phone number
 * @property {string} position - Job position or title
 * @property {string} university_id - Assigned university ID
 * @property {boolean} is_active - Account active status (default: true)
 *
 * @route GET /admin/admin-kampus/create
 * @route POST /admin/admin-kampus (form submission)
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/select
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @validation
 * - name: required
 * - email: required, valid email format, unique in users table
 * - password: required, minimum 8 characters
 * - password_confirmation: required, must match password
 * - university_id: required, must exist in universities table
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Create.tsx
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UniversityCombobox } from '@/components/ui/university-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
        title: 'Create',
        href: '/admin/admin-kampus/create',
    },
];

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Props {
    universities: University[];
}

export default function AdminKampusCreate({ universities }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        position: '',
        university_id: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.admin-kampus.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Admin Kampus" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.admin-kampus.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Create New Admin Kampus</h1>
                        <p className="mt-1 text-muted-foreground">Add a new university administrator</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Personal Information
                            </h3>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Dr. Ahmad Fauzi, M.Kom"
                                    required
                                    className="mt-2"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g., admin.uad@ajm.ac.id"
                                    required
                                    className="mt-2"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="e.g., 0274-563515"
                                    className="mt-2"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            {/* Position */}
                            <div>
                                <Label htmlFor="position">Position / Title</Label>
                                <Input
                                    id="position"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="e.g., Kepala LPPM"
                                    className="mt-2"
                                />
                                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Account Information
                            </h3>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                <p className="mt-1 text-sm text-muted-foreground">Minimum 8 characters</p>
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation">
                                    Confirm Password <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* University Assignment */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                University Assignment
                            </h3>

                            {/* University */}
                            <div>
                                <Label htmlFor="university_id">
                                    University <span className="text-red-500">*</span>
                                </Label>
                                <div className="mt-2">
                                    <UniversityCombobox
                                        universities={universities}
                                        value={data.university_id.toString()}
                                        onValueChange={(value) => setData('university_id', value)}
                                        placeholder="Select University"
                                        error={errors.university_id}
                                    />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This admin will manage journals and users for this university
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Status
                            </h3>

                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (Admin can login and manage their university)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t border-sidebar-border/70 pt-6 sm:flex-row sm:items-center dark:border-sidebar-border">
                            <Link href={route('admin.admin-kampus.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Admin Kampus'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
