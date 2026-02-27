/**
 * Profil Edit Page (User/Pengelola Jurnal area)
 *
 * @description Allows a User-role user to edit their own profile information
 *              (name, email, phone, position, scientific field) from within the user area.
 * @route       GET  /user/profil/edit  → user.profil.edit
 *              PATCH /user/profil/edit → user.profil.update
 * @features    Edit name, email, phone, position, scientific field; back button to profil index.
 */

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ScientificField, SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface EditProfilProps {
    scientificFields: ScientificField[];
    status?: string;
}

type ProfileForm = {
    name: string;
    email: string;
    phone: string;
    position: string;
    scientific_field_id: string;
};

export default function ProfilEdit({ scientificFields, status }: EditProfilProps) {
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Profil', href: route('user.profil.index') },
        { title: 'Edit Profil', href: route('user.profil.edit') },
    ];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone ?? '',
        position: auth.user.position ?? '',
        scientific_field_id: auth.user.scientific_field_id?.toString() ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('user.profil.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profil" />

            <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
                {/* Back button */}
                <Button variant="ghost" size="sm" onClick={() => history.back()} className="-ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Profil
                </Button>

                {/* Flash status */}
                {status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {status}
                    </div>
                )}

                {/* Form card */}
                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <HeadingSmall title="Edit Profil" description="Perbarui informasi profil Anda" />

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nama lengkap"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Alamat email"
                            />
                            <InputError message={errors.email} />
                            {auth.user.email_verified_at === undefined || auth.user.email_verified_at === null ? (
                                <p className="text-xs text-amber-600 dark:text-amber-400">Email belum diverifikasi.</p>
                            ) : null}
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
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

                        {/* Position */}
                        <div className="grid gap-2">
                            <Label htmlFor="position">Jabatan / Posisi</Label>
                            <Input
                                id="position"
                                name="position"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                placeholder="Dosen, Peneliti, dll."
                            />
                            <InputError message={errors.position} />
                        </div>

                        {/* Scientific Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="scientific_field_id">Bidang Ilmu</Label>
                            <Select value={data.scientific_field_id} onValueChange={(value) => setData('scientific_field_id', value)}>
                                <SelectTrigger id="scientific_field_id">
                                    <SelectValue placeholder="Pilih bidang ilmu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {scientificFields.map((field) => (
                                        <SelectItem key={field.id} value={field.id.toString()}>
                                            {field.code} — {field.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.scientific_field_id} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 dark:text-green-400">Tersimpan</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Read-only account info */}
                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <HeadingSmall title="Informasi Akun" description="Data akun (tidak dapat diubah)" />
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
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
