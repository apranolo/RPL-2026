/**
 * UniversitiesEdit Component
 *
 * @description
 * A form page for updating existing university (PTM) records.
 * This component pre-fills the form with current university data and
 * allows administrators to modify all university details.
 *
 * @component
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} code - University code
 * @property {string} name - Full name
 * @property {string} short_name - Abbreviated name
 * @property {string} address - Street address
 * @property {string} city - City
 * @property {string} province - Province
 * @property {string} postal_code - Postal code
 * @property {string} phone - Phone number
 * @property {string} email - Email address
 * @property {string} website - Website URL
 * @property {string} logo_url - URL to university logo
 * @property {boolean} is_active - Active status
 *
 * @interface Props
 * @property {University} university - University data to edit
 *
 * @route GET /admin/universities/{id}/edit
 * @route PUT /admin/universities/{id}
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/textarea
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Universities/Edit.tsx
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select UI imports removed — not used in this file
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
}

interface Props {
    university: University;
}

export default function UniversitiesEdit({ university }: Props) {
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
            title: 'Edit',
            href: `/admin/universities/${university.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        code: university.code || '',
        ptm_code: university.ptm_code || '',
        name: university.name || '',
        short_name: university.short_name || '',
        address: university.address || '',
        city: university.city || '',
        province: university.province || '',
        postal_code: university.postal_code || '',
        phone: university.phone || '',
        email: university.email || '',
        website: university.website || '',
        logo_url: university.logo_url || '',
        accreditation_status: university.accreditation_status || '',
        cluster: university.cluster || '',
        profile_description: university.profile_description || '',
        is_active: university.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.universities.update', university.id), {
            onSuccess: () => {
                toast.success('University updated successfully');
            },
            onError: () => {
                toast.error('Failed to update university. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${university.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.universities.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Edit University</h1>
                        <p className="mt-1 text-muted-foreground">Update information for {university.name}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Basic Information
                            </h3>

                            {/* Code */}
                            <div>
                                <Label htmlFor="code">
                                    University Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="e.g., UAD, UMY"
                                    required
                                    className="mt-2"
                                />
                                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                            </div>

                            {/* PTM Code */}
                            <div>
                                <Label htmlFor="ptm_code">PTM Code (PDDIKTI)</Label>
                                <Input
                                    id="ptm_code"
                                    value={data.ptm_code}
                                    onChange={(e) => setData('ptm_code', e.target.value)}
                                    placeholder="e.g., 12345 (5 digit code from PDDIKTI)"
                                    maxLength={10}
                                    className="mt-2"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Unique code from PDDIKTI for integration with national systems</p>
                                {errors.ptm_code && <p className="mt-1 text-sm text-red-600">{errors.ptm_code}</p>}
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Universitas Ahmad Dahlan"
                                    required
                                    className="mt-2"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Short Name */}
                            <div>
                                <Label htmlFor="short_name">Short Name</Label>
                                <Input
                                    id="short_name"
                                    value={data.short_name}
                                    onChange={(e) => setData('short_name', e.target.value)}
                                    placeholder="e.g., UAD"
                                    className="mt-2"
                                />
                                {errors.short_name && <p className="mt-1 text-sm text-red-600">{errors.short_name}</p>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Address Information
                            </h3>

                            <div>
                                <Label htmlFor="address">Street Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className="mt-2"
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} className="mt-2" />
                                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        className="mt-2"
                                    />
                                    {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="mt-2"
                                    />
                                    {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
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

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g., info@uad.ac.id"
                                        className="mt-2"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="e.g., https://uad.ac.id"
                                    className="mt-2"
                                />
                                {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
                            </div>

                            <div>
                                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                                <Input
                                    id="logo_url"
                                    type="url"
                                    value={data.logo_url}
                                    onChange={(e) => setData('logo_url', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="mt-2"
                                />
                                {errors.logo_url && <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>}
                            </div>
                        </div>

                        {/* University Profile */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                University Profile
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="accreditation_status">Accreditation Status</Label>
                                    <select
                                        id="accreditation_status"
                                        value={data.accreditation_status}
                                        onChange={(e) => setData('accreditation_status', e.target.value)}
                                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Accreditation</option>
                                        <option value="Unggul">Unggul</option>
                                        <option value="Baik Sekali">Baik Sekali</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Cukup">Cukup</option>
                                    </select>
                                    {errors.accreditation_status && <p className="mt-1 text-sm text-red-600">{errors.accreditation_status}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="cluster">Cluster</Label>
                                    <select
                                        id="cluster"
                                        value={data.cluster}
                                        onChange={(e) => setData('cluster', e.target.value)}
                                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Cluster</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="Utama">Utama</option>
                                        <option value="Madya">Madya</option>
                                    </select>
                                    {errors.cluster && <p className="mt-1 text-sm text-red-600">{errors.cluster}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="profile_description">Profile Description</Label>
                                <Textarea
                                    id="profile_description"
                                    value={data.profile_description}
                                    onChange={(e) => setData('profile_description', e.target.value)}
                                    rows={4}
                                    maxLength={250}
                                    placeholder="Brief description of the university (max 250 characters)"
                                    className="mt-2"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">{data.profile_description.length}/250 characters</p>
                                {errors.profile_description && <p className="mt-1 text-sm text-red-600">{errors.profile_description}</p>}
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
                                    Active (University is operational and can be assigned to users)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t border-sidebar-border/70 pt-6 sm:flex-row sm:items-center dark:border-sidebar-border">
                            <Link href={route('admin.universities.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update University'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
