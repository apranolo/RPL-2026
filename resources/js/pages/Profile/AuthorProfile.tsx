/**
 * Author Profile Management Page
 *
 * @description Halaman untuk author mengelola informasi profil akademik.
 * @route GET /profile
 * @features Input ORCID, afiliasi, dan biografi penulis.
 */

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Building2, FileText, GraduationCap, UserCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface AuthorProfileData {
    id?: number;
    user_id?: number;
    orcid?: string;
    affiliation?: string;
    bio?: string;
}

interface AuthorProfileProps {
    profile: AuthorProfileData | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil Author',
        href: '/profile',
    },
];

export default function AuthorProfile({ profile }: AuthorProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const { user } = auth;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        orcid: profile?.orcid || '',
        affiliation: profile?.affiliation || '',
        bio: profile?.bio || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            preserveScroll: true,

            onSuccess: () => {
                toast.success('Profil author berhasil diperbarui.');
            },

            onError: () => {
                toast.error('Gagal menyimpan profil.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Author" />

            <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
                {/* Header */}

                <div className="border-b border-sidebar-border/50 pb-5">
                    <h1 className="text-3xl font-extrabold tracking-tight">Profil Author</h1>

                    <p className="mt-2 text-muted-foreground">Kelola informasi akademik Anda yang akan ditampilkan pada proses submit artikel.</p>
                </div>

                {/* Summary Cards */}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm">Nama</CardTitle>

                            <UserCircle className="h-5 w-5" />
                        </CardHeader>

                        <CardContent>
                            <p className="text-lg font-bold">{user.name}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm">Universitas</CardTitle>

                            <GraduationCap className="h-5 w-5" />
                        </CardHeader>

                        <CardContent>
                            <p>{user.university?.name ?? 'Belum terdaftar'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm">Status</CardTitle>

                            <BookOpen className="h-5 w-5" />
                        </CardHeader>

                        <CardContent>
                            <p className="font-semibold text-emerald-600">Author</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Profil Author</CardTitle>

                        <CardDescription>Lengkapi informasi berikut agar identitas author tampil dengan benar pada sistem.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* ORCID */}
                            <div className="space-y-2">
                                <Label htmlFor="orcid" className="text-sm font-semibold">
                                    ORCID
                                </Label>

                                <Input
                                    id="orcid"
                                    type="text"
                                    value={data.orcid}
                                    onChange={(e) => setData('orcid', e.target.value)}
                                    placeholder="Contoh: 0000-0002-1825-0097"
                                />

                                <InputError message={errors.orcid} />
                            </div>

                            {/* Affiliation */}
                            <div className="space-y-2">
                                <Label htmlFor="affiliation" className="text-sm font-semibold">
                                    Afiliasi
                                </Label>

                                <div className="relative">
                                    <Building2 className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />

                                    <Input
                                        id="affiliation"
                                        className="pl-10"
                                        value={data.affiliation}
                                        onChange={(e) => setData('affiliation', e.target.value)}
                                        placeholder="Nama Universitas / Instansi"
                                    />
                                </div>

                                <InputError message={errors.affiliation} />
                            </div>

                            {/* Biography */}
                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-sm font-semibold">
                                    Biografi
                                </Label>

                                <div className="relative">
                                    <FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />

                                    <Textarea
                                        id="bio"
                                        rows={7}
                                        className="resize-none pl-10"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        placeholder="Tuliskan biografi singkat Anda..."
                                    />
                                </div>

                                <InputError message={errors.bio} />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-4 border-t pt-5">
                                <Button disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="transition ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-medium text-green-600">Profil berhasil disimpan.</p>
                                </Transition>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
