/**
 * AdminKampusEdit Component
 *
 * @description
 * A comprehensive form page for editing existing campus administrator (Admin Kampus) accounts.
 * This component provides a multi-section form interface for updating admin information,
 * including personal details, password changes (optional), university assignment, and status.
 * Password fields are optional - leave empty to keep the existing password.
 *
 * @component
 *
 * @interface AdminKampus
 * @property {number} id - Unique identifier for the admin kampus
 * @property {string} name - Full name of the admin
 * @property {string} email - Email address for login
 * @property {string} phone - Contact phone number
 * @property {string} position - Job position or title
 * @property {number} university_id - ID of the assigned university
 * @property {boolean} is_active - Account activation status
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated university name
 * @property {string} code - University code
 *
 * @interface Props
 * @property {AdminKampus} adminKampus - The admin kampus data to be edited
 * @property {University[]} universities - Array of available universities for assignment
 *
 * @param {Props} props - Component props
 * @param {AdminKampus} props.adminKampus - Admin data to edit
 * @param {University[]} props.universities - List of universities for assignment
 *
 * @returns The rendered admin kampus edit form
 *
 * @example
 * ```tsx
 * <AdminKampusEdit
 *   adminKampus={{
 *     id: 1,
 *     name: "John Doe",
 *     email: "john@university.edu",
 *     phone: "081234567890",
 *     position: "Administrator",
 *     university_id: 1,
 *     is_active: true
 *   }}
 *   universities={[
 *     { id: 1, name: "University of Example", short_name: "UE", code: "UE001" }
 *   ]}
 * />
 * ```
 *
 * @features
 * - Personal Information Section
 *   - Full name (required)
 *   - Email address (required, unique except current)
 *   - Phone number (optional)
 *   - Position/title (optional)
 * - Account Information Section
 *   - Password (optional - leave empty to keep current)
 *   - Password confirmation (required if password filled)
 *   - Warning message about optional password update
 * - University Assignment Section
 *   - Select university from dropdown (required)
 *   - Pre-selected with current university
 * - Status Section
 *   - Active/inactive checkbox toggle
 * - Form validation with error display
 * - Loading state during submission
 * - Cancel and update buttons
 * - Dynamic breadcrumb with admin name
 * - Back to list button
 * - Dark mode support
 * - Responsive layout
 *
 * @formData
 * @property {string} name - Admin's full name
 * @property {string} email - Login email address
 * @property {string} password - New password (optional)
 * @property {string} password_confirmation - Password confirmation (if password set)
 * @property {string} phone - Contact phone number
 * @property {string} position - Job position or title
 * @property {string} university_id - Assigned university ID
 * @property {boolean} is_active - Account active status
 *
 * @route GET /admin/admin-kampus/{id}/edit
 * @route PUT /admin/admin-kampus/{id} (form submission)
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
 * - email: required, valid email format, unique except current user
 * - password: optional, if provided minimum 8 characters
 * - password_confirmation: required if password provided, must match
 * - university_id: required, must exist in universities table
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Edit.tsx
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UniversityCombobox } from '@/components/ui/university-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface AdminKampus {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    university_id: number;
    is_active: boolean;
}

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Props {
    adminKampus: AdminKampus;
    universities: University[];
}

export default function AdminKampusEdit({ adminKampus, universities }: Props) {
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
        {
            title: 'Edit',
            href: `/admin/admin-kampus/${adminKampus.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: adminKampus.name || '',
        email: adminKampus.email || '',
        password: '',
        password_confirmation: '',
        phone: adminKampus.phone || '',
        position: adminKampus.position || '',
        university_id: adminKampus.university_id.toString() || '',
        is_active: adminKampus.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.admin-kampus.update', adminKampus.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${adminKampus.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.admin-kampus.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Edit Admin Kampus</h1>
                        <p className="mt-1 text-muted-foreground">Update information for {adminKampus.name}</p>
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
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="mt-2" />
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
                                    required
                                    className="mt-2"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-2" />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            {/* Position */}
                            <div>
                                <Label htmlFor="position">Position / Title</Label>
                                <Input id="position" value={data.position} onChange={(e) => setData('position', e.target.value)} className="mt-2" />
                                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Account Information
                            </h3>

                            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Leave password fields empty if you don't want to change the password
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-2"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
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
                                        value={data.university_id}
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
                        <div className="flex items-center justify-end gap-4 border-t border-sidebar-border/70 pt-6 dark:border-sidebar-border">
                            <Link href={route('admin.admin-kampus.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Admin Kampus'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
