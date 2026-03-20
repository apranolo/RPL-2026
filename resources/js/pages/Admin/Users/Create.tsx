/**
 * UsersCreate Component
 *
 * @description
 * A comprehensive form page for creating new Pengelola Jurnal (Journal Manager) accounts.
 * Super Admin can create User role accounts and assign them to any university.
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
 * @features
 * - Personal Information Section (name, email, phone)
 * - Account Information Section (password, confirmation)
 * - University Assignment Section
 * - Reviewer Status Toggle (v1.1 feature)
 * - Active Status Toggle
 * - Form validation with error display
 * - Loading state during submission
 * - Cancel and submit buttons
 * - Breadcrumb navigation
 * - Dark mode support
 *
 * @formData
 * @property {string} name - User's full name
 * @property {string} email - Login email address
 * @property {string} password - Account password
 * @property {string} password_confirmation - Password confirmation
 * @property {string} phone - Contact phone number
 * @property {string} university_id - Assigned university ID
 * @property {boolean} is_reviewer - Reviewer status (default: false)
 * @property {boolean} is_active - Account active status (default: true)
 *
 * @route GET /admin/users/create
 * @route POST /admin/users (form submission)
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Users/Create.tsx
 */
import MultiRoleSelect from '@/components/multi-role-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversityCombobox } from '@/components/ui/university-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
    {
        title: 'Create',
        href: '/admin/users/create',
    },
];

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface ScientificField {
    id: number;
    name: string;
    code: string;
}

interface Props {
    universities: University[];
    roles: Role[];
    scientificFields: ScientificField[];
}

export default function UsersCreate({ universities, roles, scientificFields }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        university_id: '',
        scientific_field_id: '',
        role_ids: [] as number[],
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                toast.success('Pengelola Jurnal created successfully');
            },
            onError: () => {
                toast.error('Failed to create Pengelola Jurnal. Please check the form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pengelola Jurnal" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Create New Pengelola Jurnal</h1>
                        <p className="mt-1 text-muted-foreground">Add a new journal manager</p>
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
                                    placeholder="e.g., Budi Santoso, S.Kom., M.T."
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
                                    placeholder="e.g., budi.santoso@ajm.ac.id"
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
                                    placeholder="e.g., 0812-3456-7890"
                                    className="mt-2"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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
                                    <p className="mt-1 text-sm text-muted-foreground">This user will manage journals for this university</p>
                                </div>
                            </div>

                            {/* Scientific Field */}
                            <div>
                                <Label htmlFor="scientific_field_id">Scientific Field</Label>
                                <Select
                                    value={data.scientific_field_id || undefined}
                                    onValueChange={(value) => setData('scientific_field_id', value || '')}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select Scientific Field (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scientificFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id.toString()}>
                                                {field.code} - {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.scientific_field_id && <p className="mt-1 text-sm text-red-600">{errors.scientific_field_id}</p>}
                                <p className="mt-1 text-sm text-muted-foreground">Bidang ilmu pengelola jurnal (optional, untuk filtering)</p>
                            </div>
                        </div>

                        {/* Role Assignment */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Role Assignment
                            </h3>

                            <MultiRoleSelect
                                roles={roles}
                                selectedRoleIds={data.role_ids}
                                onChange={(roleIds) => setData('role_ids', roleIds)}
                                label="Assign Roles"
                                error={errors.role_ids}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Users can have multiple roles. For example, a user can be both a Pengelola Jurnal and a Reviewer.
                            </p>
                        </div>

                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Account Status
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
                                    Active (User can login and access the system)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t border-sidebar-border/70 pt-6 sm:flex-row sm:items-center dark:border-sidebar-border">
                            <Link href={route('admin.users.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
