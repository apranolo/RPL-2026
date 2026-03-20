import { type BreadcrumbItem, type ScientificField, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Camera, CheckCircle, Clock, ShieldCheck, Trash2, Upload, XCircle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { toast } from 'sonner';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

/**
 * Sanitize a URL to only allow safe protocols for use in image src attributes.
 * Prevents XSS via javascript: or data: (non-image) URIs (CWE-79, CWE-116).
 */
const sanitizeImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    // Allow only safe URL schemes: https, http, blob (local object URLs), and data:image/*
    if (/^(https?:\/\/|blob:|data:image\/)/i.test(url)) {
        return url;
    }
    return '';
};

type ProfileForm = {
    name: string;
    email: string;
    phone: string;
    position: string;
    scientific_field_id: string;
};

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    scientificFields: ScientificField[];
}

export default function Profile({ mustVerifyEmail, status, scientificFields }: ProfileProps) {
    const { auth, flash } = usePage<SharedData & { flash: { success?: string; error?: string } }>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        position: auth.user.position || '',
        scientific_field_id: auth.user.scientific_field_id?.toString() || '',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('File type not allowed. Please upload JPG or PNG.');
            return;
        }

        // Validate file size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size exceeds 2MB limit.');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const uploadAvatar = () => {
        if (!avatarFile) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        router.post(route('profile.upload-avatar'), formData, {
            onSuccess: () => {
                toast.success('Avatar updated successfully');
                setAvatarFile(null);
                setAvatarPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errors) => {
                toast.error(errors.avatar || 'Failed to upload avatar');
            },
            onFinish: () => {
                setUploadingAvatar(false);
            },
        });
    };

    const deleteAvatar = () => {
        if (!confirm('Are you sure you want to remove your avatar?')) return;

        router.delete(route('profile.delete-avatar'), {
            onSuccess: () => {
                toast.success('Avatar removed successfully');
            },
            onError: () => {
                toast.error('Failed to remove avatar');
            },
        });
    };

    const cancelAvatarPreview = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
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

                    {/* Avatar Section */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <HeadingSmall title="Profile Picture" description="Update your avatar" />

                        <div className="mt-4 flex items-start gap-6">
                            {/* Avatar Display */}
                            <div className="relative">
                                {avatarPreview || auth.user.avatar_url ? (
                                    <img
                                        src={sanitizeImageUrl(avatarPreview || auth.user.avatar_url)}
                                        alt={auth.user.name}
                                        className="h-24 w-24 rounded-full object-cover ring-2 ring-sidebar-border"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 ring-2 ring-sidebar-border dark:bg-blue-900/20">
                                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {auth.user.initials || auth.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Avatar Controls */}
                            <div className="flex-1 space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />

                                {avatarPreview ? (
                                    <div className="flex gap-2">
                                        <Button type="button" onClick={uploadAvatar} disabled={uploadingAvatar} size="sm">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {uploadingAvatar ? 'Uploading...' : 'Upload'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={cancelAvatarPreview} disabled={uploadingAvatar} size="sm">
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} size="sm">
                                            <Camera className="mr-2 h-4 w-4" />
                                            Change Avatar
                                        </Button>
                                        {auth.user.avatar_url && auth.user.avatar_url.startsWith('/storage/avatars/') && (
                                            <Button type="button" variant="destructive" onClick={deleteAvatar} size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">JPG or PNG. Max size 2MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <HeadingSmall title="Profile Information" description="Update your personal details" />

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder="+62 xxx xxx xxx"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    name="position"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="Lecturer, Researcher, etc."
                                />
                                <InputError message={errors.position} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scientific_field_id">Scientific Field</Label>
                                <Select value={data.scientific_field_id} onValueChange={(value) => setData('scientific_field_id', value)}>
                                    <SelectTrigger id="scientific_field_id">
                                        <SelectValue placeholder="Select scientific field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scientificFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id.toString()}>
                                                {field.code} - {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.scientific_field_id} />
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                                <Button disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 dark:text-green-400">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                    {/* Account Information (Read-only) */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <HeadingSmall title="Account Information" description="Your account details (read-only)" />
                        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Role</dt>
                                <dd className="mt-1 text-sm font-medium">{auth.user.role?.display_name ?? auth.user.role?.name ?? '—'}</dd>
                            </div>
                            {auth.user.university && (
                                <div>
                                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Universitas</dt>
                                    <dd className="mt-1 text-sm font-medium">{auth.user.university.name}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status Akun</dt>
                                <dd className="mt-1">
                                    {auth.user.approval_status === 'approved' ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" /> Approved
                                        </span>
                                    ) : auth.user.approval_status === 'rejected' ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                                            <XCircle className="h-4 w-4" /> Rejected
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                            <Clock className="h-4 w-4" /> Pending
                                        </span>
                                    )}
                                </dd>
                            </div>
                            {auth.user.last_login_at && (
                                <div>
                                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Login Terakhir</dt>
                                    <dd className="mt-1 text-sm text-muted-foreground">
                                        {new Date(auth.user.last_login_at).toLocaleString('id-ID')}
                                    </dd>
                                </div>
                            )}
                            {auth.user.created_at && (
                                <div>
                                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Member Sejak</dt>
                                    <dd className="mt-1 text-sm text-muted-foreground">
                                        {new Date(auth.user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Verifikasi Email</dt>
                                <dd className="mt-1">
                                    {auth.user.email_verified_at ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                                            <ShieldCheck className="h-4 w-4" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                            <Clock className="h-4 w-4" /> Belum diverifikasi
                                        </span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
