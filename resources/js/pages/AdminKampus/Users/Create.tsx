/**
 * UsersCreate Component for Admin Kampus
 *
 * @description
 * A form page for creating new user accounts within the admin's university.
 * University is auto-assigned from admin's profile. Multiple roles can be assigned.
 *
 * @features
 * - Personal information fields (name, email, phone, position)
 * - Password with confirmation
 * - Multi-role selection (not Super Admin)
 * - Status toggle
 * - Form validation with error display
 * - University displayed as read-only info
 *
 * @route GET /admin-kampus/users/create
 * @route POST /admin-kampus/users
 */
import MultiRoleSelect from '@/components/multi-role-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';

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
        title: 'Create',
        href: '/admin-kampus/users/create',
    },
];

interface University {
    id: number;
    name: string;
    short_name: string;
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
    university: University;
    roles: Role[];
    scientificFields: ScientificField[];
}

export default function UsersCreate({ university, roles, scientificFields }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        position: '',
        scientific_field_id: '',
        role_ids: [] as number[],
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-kampus.users.store'), {
            onSuccess: () => {
                toast.success('User created successfully');
            },
            onError: () => {
                toast.error('Failed to create user. Please check the form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
                        <p className="mt-1 text-muted-foreground">Add a new user (Pengelola Jurnal) for {university.name}</p>
                    </div>

                    {/* University Info */}
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                University: {university.name} ({university.short_name})
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">This user will be automatically assigned to your university.</p>
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
                                    placeholder="e.g., John Doe"
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
                                    placeholder="e.g., john.doe@example.com"
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
                                    placeholder="e.g., 081234567890"
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
                                    placeholder="e.g., Editor, Managing Editor"
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

                        {/* Scientific Field */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Scientific Field
                            </h3>

                            <div>
                                <Label htmlFor="scientific_field_id">Bidang Ilmu</Label>
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
                                error={errors.role_ids}
                                label="User Roles"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Select one or more roles for this user. The first selected role will be the primary role.
                            </p>
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
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (User can login and manage journals)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t border-sidebar-border/70 pt-6 sm:flex-row sm:items-center dark:border-sidebar-border">
                            <Link href={route('admin-kampus.users.index')}>
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
