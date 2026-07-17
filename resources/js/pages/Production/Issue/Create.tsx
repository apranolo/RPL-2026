/**
 * IssueCreate Component
 *
 * @description
 * A form page for creating new journal production issues.
 * Users can input issue metadata including volume, number, year,
 * thematic title, and description.
 *
 * @component
 *
 * @formData
 * @property {string} volume - Issue volume number
 * @property {string} nomor - Issue number within the volume
 * @property {number} tahun - Publication year (defaults to current year)
 * @property {string} judul_tematik - Thematic title (optional)
 * @property {string} deskripsi - Issue description
 *
 * @route GET /production/issues/create
 * @route POST /production/issues (form submission via store())
 *
 * @author ANGGASTA VYAKTATAMA KAHFI
 * @filepath /resources/js/pages/Production/Issue/Create.tsx
 */
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        title: 'Production',
        href: '#',
    },
    {
        title: 'Issues',
        href: '#',
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function IssueCreate() {
    const { data, setData, post, processing, errors } = useForm({
        volume: '',
        number: '',
        year: new Date().getFullYear(),
        title: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('production.issue.store'), {
            onSuccess: () => {
                toast.success('Issue berhasil dibuat');
            },
            onError: () => {
                toast.error('Gagal membuat issue. Periksa kembali form yang diisi.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Issue Baru" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('dashboard')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Buat Issue Baru</h1>
                        <p className="mt-1 text-muted-foreground">Tambahkan metadata issue baru ke dalam jurnal.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informasi Issue */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Informasi Issue
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Volume */}
                                <div>
                                    <Label htmlFor="volume">
                                        Volume <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="volume"
                                        type="number"
                                        value={data.volume}
                                        onChange={(e) => setData('volume', e.target.value)}
                                        placeholder="Contoh: 1"
                                        required
                                        className="mt-2"
                                    />
                                    <InputError message={errors.volume} />
                                </div>

                                {/* Nomor */}
                                <div>
                                    <Label htmlFor="number">
                                        Nomor <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="number"
                                        type="number"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        placeholder="Contoh: 1"
                                        required
                                        className="mt-2"
                                    />
                                    <InputError message={errors.number} />
                                </div>

                                {/* Tahun */}
                                <div>
                                    <Label htmlFor="year">
                                        Tahun <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={data.year}
                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                        placeholder="Contoh: 2026"
                                        required
                                        className="mt-2"
                                    />
                                    <InputError message={errors.year} />
                                </div>
                            </div>
                        </div>

                        {/* Detail Tematik */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Detail Tematik
                            </h3>

                            {/* Judul Tematik */}
                            <div>
                                <Label htmlFor="title">Judul Tematik</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul tematik (jika ada)"
                                    className="mt-2"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Opsional. Isi jika issue ini memiliki tema khusus.</p>
                                <InputError message={errors.title} />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Masukkan deskripsi issue ini"
                                    className="mt-2"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t border-sidebar-border/70 pt-6 sm:flex-row sm:items-center dark:border-sidebar-border">
                            <Link href={route('dashboard')}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Issue'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
