/**
 * CriteriaCreate Component
 *
 * @description
 * Form page for creating new Kriteria Penilaian (Assessment Criteria).
 * Super Admin can create criteria linked to a sub-category with
 * configurable answer types, weights, and attachment requirements.
 *
 * @route GET /admin/criteria/create
 * @route POST /admin/criteria (store)
 *
 * @features
 * - Create new assessment criterion
 * - Sub-category selection with template/category context
 * - Answer type selector with live preview (DynamicInput)
 * - Weight and sort order configuration
 * - Attachment requirement toggle
 * - Active status toggle
 * - Form validation with error display
 *
 * @author JurnalMU Team
 */
import { AnswerTypePreview } from '@/components/DynamicInput';
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
import { ArrowLeft, ClipboardList, Paperclip, Save } from 'lucide-react';
import { toast } from 'sonner';

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
        title: 'Tambah',
        href: '/admin/criteria/create',
    },
];

interface SubCategory {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    template_name: string;
}

interface Props {
    subCategories: SubCategory[];
}

export default function CriteriaCreate({ subCategories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        sub_category_id: '' as string,
        code: '',
        question: '',
        description: '',
        weight: '1.00',
        answer_type: '' as 'boolean' | 'scale' | 'text' | '',
        requires_attachment: false,
        sort_order: '' as string,
        is_active: true,
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
        post(route('admin.criteria.store'), {
            onSuccess: () => {
                toast.success('Kriteria Penilaian berhasil dibuat');
            },
            onError: () => {
                toast.error('Gagal membuat kriteria. Silakan periksa form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kriteria Penilaian" />

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
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardList className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Tambah Kriteria Penilaian</h1>
                            <p className="mt-1 text-base text-muted-foreground">
                                Buat kriteria baru untuk evaluasi penilaian jurnal
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
                                    <SelectTrigger
                                        id="sub_category_id"
                                        className={errors.sub_category_id ? 'border-destructive' : ''}
                                    >
                                        <SelectValue placeholder="Pilih sub-kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                            <SelectGroup key={groupName}>
                                                <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                                {errors.sub_category_id && <p className="text-sm text-destructive">{errors.sub_category_id}</p>}
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
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
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
                                    {errors.sort_order && <p className="text-sm text-destructive">{errors.sort_order}</p>}
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
                                {errors.question && <p className="text-sm text-destructive">{errors.question}</p>}
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
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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
                                        <SelectTrigger
                                            id="answer_type"
                                            className={errors.answer_type ? 'border-destructive' : ''}
                                        >
                                            <SelectValue placeholder="Pilih tipe jawaban" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boolean">Ya / Tidak</SelectItem>
                                            <SelectItem value="scale">Skala 1-5</SelectItem>
                                            <SelectItem value="text">Teks Bebas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.answer_type && <p className="text-sm text-destructive">{errors.answer_type}</p>}
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
                                    {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
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
                                            <p className="text-sm text-muted-foreground">
                                                Evaluator wajib mengunggah bukti dokumen
                                            </p>
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
                                            <p className="text-sm text-muted-foreground">
                                                Kriteria aktif akan ditampilkan dalam form evaluasi
                                            </p>
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
                            {processing ? 'Menyimpan...' : 'Simpan Kriteria'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
