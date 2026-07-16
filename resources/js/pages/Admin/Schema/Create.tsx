/**
 * SchemaCreate Component
 *
 * @description
 * Form page for creating a new Research Schema (Skema Penelitian).
 * Super Admin can add new schemas with a name and optional description.
 *
 * @route GET  /admin/schema/create
 * @route POST /admin/schema
 *
 * @features
 * - Create new research schema
 * - Name field (required, unique)
 * - Description field (optional)
 * - Form validation with error messages
 *
 * @author JurnalMU Team
 */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Skema Penelitian',
        href: route('admin.schema.index'),
    },
    {
        title: 'Tambah Skema',
        href: route('admin.schema.create'),
    },
];

export default function SchemaCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.schema.store'), {
            onSuccess: () => {
                toast.success('Skema Penelitian berhasil ditambahkan.');
            },
            onError: () => {
                toast.error('Gagal menambahkan skema. Periksa kembali form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Skema Penelitian" />

            <div className="mx-auto max-w-2xl space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <Button variant="ghost" size="sm" className="h-auto gap-2 p-0" asChild>
                        <Link href={route('admin.schema.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FlaskConical className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Tambah Skema Penelitian</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Tambahkan skema penelitian baru ke dalam sistem</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Skema</CardTitle>
                        <CardDescription>Isi detail skema penelitian yang akan ditambahkan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nama Skema */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Skema <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Penelitian Dasar, Penelitian Terapan, PDUPT..."
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                <p className="text-xs text-muted-foreground">Nama skema harus unik dan belum digunakan.</p>
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat mengenai skema penelitian ini..."
                                    rows={4}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                <p className="text-xs text-muted-foreground">Opsional. Maksimal 1000 karakter.</p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.schema.index')}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Skema'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
