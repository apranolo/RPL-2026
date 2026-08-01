/**
 * AnnouncementForm Component
 *
 * @description
 * Form for creating or editing an announcement from the admin dashboard.
 * Supports title, description, content, university selection, publication date,
 * expiration date (tanggal kadaluarsa), visibility, featured status,
 * and thumbnail upload.
 *
 * @route GET /admin/announcements/create
 * @route GET /admin/announcements/{announcement}/edit
 * @route POST /admin/announcements
 * @route PUT /admin/announcements/{announcement}
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JournalCombobox, type Journal } from '@/components/ui/journal-combobox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const toDateTimeLocalValue = (value?: string | null) => {
    if (!value) return '';

    return value.replace(' ', 'T').slice(0, 16);
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'Form', href: '#' },
];

interface AnnouncementData {
    id?: number;
    title: string;
    description: string;
    content: string;
    journal_id: string;
    published_at: string;
    expires_at: string;
    is_active: boolean;
    is_featured: boolean;
    thumbnail?: string;
}

interface Props {
    journals: Journal[];
    announcement?: AnnouncementData | null;
}

export default function AnnouncementForm({ journals, announcement }: Props) {
    const isEditing = Boolean(announcement?.id);

    const { data, setData, post, put, processing, errors } = useForm<{
        title: string;
        description: string;
        content: string;
        journal_id: string;
        published_at: string;
        expires_at: string;
        is_active: boolean;
        is_featured: boolean;
        thumbnail: File | null;
    }>({
        title: announcement?.title ?? '',
        description: announcement?.description ?? '',
        content: announcement?.content ?? '',
        journal_id: announcement?.journal_id?.toString() ?? '',
        published_at: toDateTimeLocalValue(announcement?.published_at),
        expires_at: toDateTimeLocalValue(announcement?.expires_at),
        is_active: announcement?.is_active ?? true,
        is_featured: announcement?.is_featured ?? false,
        thumbnail: null,
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const submit = isEditing
            ? put(route('admin.announcements.update', announcement?.id), {
                  forceFormData: true,
                  onSuccess: () => toast.success('Announcement updated successfully.'),
                  onError: () => toast.error('Please review the form and fix the highlighted errors.'),
              })
            : post(route('admin.announcements.store'), {
                  forceFormData: true,
                  onSuccess: () => toast.success('Announcement created successfully.'),
                  onError: () => toast.error('Please review the form and fix the highlighted errors.'),
              });

        void submit;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Announcement' : 'Create Announcement'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="mb-6 flex items-start justify-between gap-3">
                        <div>
                            <Link
                                href={route('admin.announcements.index')}
                                className="mb-3 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to form
                            </Link>
                            <h1 className="text-2xl font-semibold text-foreground">{isEditing ? 'Edit Announcement' : 'Create Announcement'}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Isi informasi pengumuman dan atur tanggal kadaluarsa jika diperlukan.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="title">
                                    Judul <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(event) => setData('title', event.target.value)}
                                    placeholder="Masukkan judul pengumuman"
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="description">Deskripsi Singkat</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    placeholder="Deskripsi singkat untuk ringkasan pengumuman"
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="content">
                                    Konten <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="content"
                                    rows={8}
                                    value={data.content}
                                    onChange={(event) => setData('content', event.target.value)}
                                    placeholder="Tulis isi pengumuman lengkap di sini"
                                />
                                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="journal_id">
                                    Jurnal <span className="text-red-500">*</span>
                                </Label>
                                <JournalCombobox
                                    journals={journals}
                                    value={data.journal_id}
                                    onValueChange={(value) => setData('journal_id', value)}
                                    placeholder="Pilih jurnal"
                                    error={errors.journal_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">Thumbnail</Label>
                                <Input
                                    id="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => setData('thumbnail', event.target.files?.[0] ?? null)}
                                />
                                {errors.thumbnail && <p className="text-sm text-red-500">{errors.thumbnail}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="published_at">Tanggal Publikasi</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(event) => setData('published_at', event.target.value)}
                                />
                                {errors.published_at && <p className="text-sm text-red-500">{errors.published_at}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires_at">Tanggal Kadaluarsa</Label>
                                <Input
                                    id="expires_at"
                                    type="datetime-local"
                                    value={data.expires_at}
                                    onChange={(event) => setData('expires_at', event.target.value)}
                                />
                                {errors.expires_at && <p className="text-sm text-red-500">{errors.expires_at}</p>}
                            </div>
                        </div>

                        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <Label htmlFor="is_active" className="text-sm font-medium">
                                        Aktif
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Tampilkan pengumuman ini di daftar publik.</p>
                                </div>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(value) => setData('is_active', value)} />
                            </div>
                            {errors.is_active && <p className="mt-2 text-sm text-red-500">{errors.is_active}</p>}

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div>
                                    <Label htmlFor="is_featured" className="text-sm font-medium">
                                        Unggulan
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Tandai pengumuman ini sebagai unggulan.</p>
                                </div>
                                <Switch id="is_featured" checked={data.is_featured} onCheckedChange={(value) => setData('is_featured', value)} />
                            </div>
                            {errors.is_featured && <p className="mt-2 text-sm text-red-500">{errors.is_featured}</p>}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Link href={route('admin.announcements.index')}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? 'Simpan Perubahan' : 'Simpan Pengumuman'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
