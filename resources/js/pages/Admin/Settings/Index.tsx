import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ImageIcon, Save } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

interface SettingsProps {
    settings: {
        app_name: string;
        app_logo: string | null;
    };
}

export default function SettingsIndex({ settings }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || '',
        app_logo: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(settings.app_logo ? `/storage/${settings.app_logo}` : null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_logo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const breadcrumbs = [
        {
            title: 'Admin',
            href: '/admin/dashboard',
        },
        {
            title: 'Pengaturan Sistem',
            href: '/admin/settings/profile',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Sistem" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6">
                <Card className="mx-auto w-full max-w-2xl border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">Profil Sistem</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Ubah identitas aplikasi seperti nama dan logo yang akan ditampilkan secara global.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* App Name */}
                            <div className="space-y-3">
                                <Label htmlFor="app_name" className="text-sm font-medium">
                                    Nama Aplikasi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="app_name"
                                    type="text"
                                    value={data.app_name}
                                    onChange={(e) => setData('app_name', e.target.value)}
                                    placeholder="Masukkan nama aplikasi..."
                                    className="h-11"
                                />
                                {errors.app_name && <p className="text-sm font-medium text-red-500">{errors.app_name}</p>}
                            </div>

                            {/* App Logo */}
                            <div className="space-y-3">
                                <Label htmlFor="app_logo" className="text-sm font-medium">
                                    Logo Aplikasi
                                </Label>

                                <div className="mt-2 flex items-start gap-6 sm:items-center">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-sidebar-border/70 bg-neutral-50 dark:border-sidebar-border dark:bg-neutral-900">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Logo Preview" className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            id="app_logo"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                                            onChange={handleFileChange}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format yang didukung: PNG, JPG, JPEG, SVG. Maksimal ukuran: 2MB. Rekomendasi rasio: Persegi (1:1).
                                        </p>
                                        {errors.app_logo && <p className="text-sm font-medium text-red-500">{errors.app_logo}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
