/**
 * IssueEdit Component
 *
 * @description
 * A form page for editing existing journal production issue metadata.
 * Pre-populates form fields with current issue data and sends a PUT
 * request to update volume, number, year, thematic title, and description.
 *
 * @component
 *
 * @props
 * @property {IssueData} issue - The existing issue data to edit
 *
 * @formData
 * @property {string} volume - Issue volume number
 * @property {string} nomor - Issue number within the volume
 * @property {number} tahun - Publication year
 * @property {string} judul_tematik - Thematic title (optional)
 * @property {string} deskripsi - Issue description (optional)
 *
 * @route GET /production/issues/{issue}/edit
 * @route PUT /production/issues/{issue} (form submission via update())
 *
 * @author ANGGASTA VYAKTATAMA KAHFI
 * @filepath /resources/js/pages/Production/Issue/Edit.tsx
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

interface IssueData {
    id: number;
    volume: string;
    number: string;
    year: number;
    judul_tematik: string | null;
    deskripsi: string | null;
    status: string;
}

interface EditProps {
    issue: IssueData;
}

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
        title: 'Edit',
        href: '#',
    },
];

export default function IssueEdit({ issue }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        volume: issue.volume,
        number: issue.number,
        year: issue.year,
        judul_tematik: issue.judul_tematik ?? '',
        deskripsi: issue.deskripsi ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('production.issue.update', issue.id), {
            onSuccess: () => {
                toast.success('Issue berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui issue. Periksa kembali form yang diisi.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Issue" />

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
                        <h1 className="text-3xl font-bold text-foreground">Edit Issue</h1>
                        <p className="mt-1 text-muted-foreground">Perbarui metadata issue jurnal Anda.</p>
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
                                        type="text"
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
                                        type="text"
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
                                <Label htmlFor="judul_tematik">Judul Tematik</Label>
                                <Input
                                    id="judul_tematik"
                                    type="text"
                                    value={data.judul_tematik}
                                    onChange={(e) => setData('judul_tematik', e.target.value)}
                                    placeholder="Masukkan judul tematik (jika ada)"
                                    className="mt-2"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Opsional. Isi jika issue ini memiliki tema khusus.</p>
                                <InputError message={errors.judul_tematik} />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    rows={4}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Masukkan deskripsi issue ini"
                                    className="mt-2"
                                />
                                <InputError message={errors.deskripsi} />
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
                                {processing ? 'Menyimpan...' : 'Perbarui Issue'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
