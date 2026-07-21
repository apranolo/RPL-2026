/**
 * CriteriaEdit Component
 *
 * @description
 * Form page for editing existing Kriteria Penilaian (Assessment Criteria).
 * Super Admin can update all fields of a criterion including its
 * sub-category, answer type, weight, and status.
 *
 * @route GET /admin/criteria/{criterion}/edit
 * @route PUT /admin/criteria/{criterion} (update)
 *
 * @features
 * - Edit existing assessment criterion
 * - Pre-filled form with current values
 * - Sub-category reassignment
 * - Answer type change with live preview
 * - Same validation as create form
 *
 * @author JurnalMU Team
 */
import { AnswerTypePreview } from '@/components/DynamicInput';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SubCategory {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    template_name: string;
}

interface Criterion {
    id: number;
    code: string;
    question: string;
    description?: string;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
    requires_attachment: boolean;
    sort_order?: number;
    is_active: boolean;
    sub_category_id?: number;
}

interface Props {
    criterion: Criterion;
    subCategories: SubCategory[];
}

export default function CriteriaEdit({ criterion, subCategories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Kriteria Penilaian',
            href: '/admin/criteria',
        },
        {
            title: criterion.code,
            href: `/admin/criteria/${criterion.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/criteria/${criterion.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        sub_category_id: criterion.sub_category_id?.toString() || '',
        code: criterion.code,
        question: criterion.question,
        description: criterion.description || '',
        weight: criterion.weight.toString(),
        answer_type: criterion.answer_type as 'boolean' | 'scale' | 'text' | '',
        requires_attachment: criterion.requires_attachment,
        sort_order: criterion.sort_order?.toString() || '',
        is_active: criterion.is_active,
    });

    // Group sub-categories by template > category
    const groupedSubCategories = subCategories.reduce(
        (acc, sub) => {
            const groupKey = `${sub.template_name} › ${sub.category_name}`;
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(sub);
            return acc;
        },
        {} as Record<string, SubCategory[]>,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.criteria.update', criterion.id), {
            onSuccess: () => {
                toast.success('Kriteria Penilaian berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui kriteria. Silakan periksa form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${criterion.code}`} />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <Button variant="ghost" size="sm" className="h-auto gap-2 p-0" asChild>
                        <Link href={route('admin.criteria.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                            <Pencil className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Kriteria Penilaian</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Perbarui kriteria <span className="font-semibold text-foreground">{criterion.code}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Klasifikasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Klasifikasi</CardTitle>
                            <CardDescription>Tentukan posisi kriteria dalam hierarki evaluasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="sub_category_id">
                                    Sub-Kategori <span className="text-destructive">*</span>
                                </Label>
                                <Select value={data.sub_category_id} onValueChange={(value) => setData('sub_category_id', value)}>
                                    <SelectTrigger id="sub_category_id" className={errors.sub_category_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih sub-kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                            <SelectGroup key={groupName}>
                                                <SelectLabel className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    {groupName}
                                                </SelectLabel>
                                                {subs.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id.toString()}>
                                                        {sub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Sub-kategori menentukan Template &rarr; Kategori &rarr; Sub-Kategori hierarki
                                </p>
                                <InputError message={errors.sub_category_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Kriteria */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Kriteria</CardTitle>
                            <CardDescription>Informasi dasar kriteria penilaian</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        Kode Kriteria <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., KP-01"
                                        className={errors.code ? 'border-destructive' : ''}
                                    />
                                    <p className="text-sm text-muted-foreground">Kode unik untuk identifikasi kriteria</p>
                                    <InputError message={errors.code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan Tampil</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="1"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        placeholder="Otomatis jika kosong"
                                        className={errors.sort_order ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.sort_order} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question">
                                    Pertanyaan <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="question"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    placeholder="Tuliskan pertanyaan kriteria penilaian..."
                                    rows={3}
                                    className={errors.question ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.question} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Penjelasan detail mengenai kriteria ini..."
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                <p className="text-sm text-muted-foreground">Berikan penjelasan tambahan untuk membantu evaluator</p>
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Konfigurasi Penilaian */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Konfigurasi Penilaian</CardTitle>
                            <CardDescription>Atur tipe jawaban, bobot, dan persyaratan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="answer_type">
                                        Tipe Jawaban <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.answer_type}
                                        onValueChange={(value: 'boolean' | 'scale' | 'text') => setData('answer_type', value)}
                                    >
                                        <SelectTrigger id="answer_type" className={errors.answer_type ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih tipe jawaban" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boolean">Ya / Tidak</SelectItem>
                                            <SelectItem value="scale">Skala 1-5</SelectItem>
                                            <SelectItem value="text">Teks Bebas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.answer_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight">
                                        Bobot <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        placeholder="1.00"
                                        className={errors.weight ? 'border-destructive' : ''}
                                    />
                                    <p className="text-sm text-muted-foreground">Bobot penilaian (0 - 100)</p>
                                    <InputError message={errors.weight} />
                                </div>
                            </div>

                            {/* Answer Type Preview */}
                            {data.answer_type && <AnswerTypePreview answerType={data.answer_type} />}

                            {/* Toggles */}
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label htmlFor="requires_attachment" className="cursor-pointer">
                                                Wajib Lampiran
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Evaluator wajib mengunggah bukti dokumen</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="requires_attachment"
                                        checked={data.requires_attachment}
                                        onCheckedChange={(checked) => setData('requires_attachment', checked)}
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="is_active" className="cursor-pointer">
                                                Status Aktif
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Kriteria aktif akan ditampilkan dalam form evaluasi</p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('admin.criteria.index')}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Perbarui Kriteria'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
