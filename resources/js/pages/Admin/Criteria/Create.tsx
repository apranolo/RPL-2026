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
import {
    AnswerTypePreview,
} from '@/components/DynamicInput';
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
import InputError from '@/components/input-error';


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
    const { data, setData, post, processing, errors: rawErrors } = useForm({
        sub_category_id: '',
        criteria: [
            {
                id: crypto.randomUUID(),
                code: '',
                question: '',
                description: '',
                weight: '1.00',
                answer_type: '',
                requires_attachment: false,
                sort_order: '',
                is_active: true,
            },
        ],
    });

    // Cast errors for dynamic nested key access (e.g. criteria.0.code)
    const errors = rawErrors as Record<string, string>;

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

    // Helper untuk mengubah field spesifik pada indeks kriteria tertentu
    const updateCriteriaField = (index: number, field: string, value: any) => {
        const updated = [...data.criteria];
        updated[index] = { ...updated[index], [field]: value };
        setData('criteria', updated);
    };

    // Fungsi untuk menambah baris form kriteria baru
    const addCriteriaRow = () => {
        setData('criteria', [
            ...data.criteria,
            {
                id: crypto.randomUUID(),
                code: '',
                question: '',
                description: '',
                weight: '1.00',
                answer_type: '',
                requires_attachment: false,
                sort_order: '',
                is_active: true,
            }
        ]);
    };

    // Fungsi untuk menghapus baris kriteria
    const removeCriteriaRow = (index: number) => {
        if (data.criteria.length === 1) {
            toast.error('Minimal harus ada 1 kriteria penilaian');
            return;
        }
        const updated = data.criteria.filter((_, i) => i !== index);
        setData('criteria', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.criteria.store'), {
            onSuccess: () => toast.success('Batch Kriteria Penilaian berhasil dibuat'),
            onError: () => toast.error('Gagal membuat kriteria. Silakan periksa kembali form.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kriteria Penilaian" />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header (Tetap seperti kode kamu) */}
                <div className="space-y-3">
                    <Button variant="ghost" size="sm" className="h-auto gap-2 p-0" asChild>
                        <Link href={route('admin.criteria.index')}><ArrowLeft className="h-4 w-4" /> Kembali</Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tambah Kriteria Penilaian (Batch)</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. KARDUS KLASIFIKASI (Hanya pilih sekali di atas) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Klasifikasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="sub_category_id">Sub-Kategori <span className="text-destructive">*</span></Label>
                                <Select value={data.sub_category_id} onValueChange={(val) => setData('sub_category_id', val)}>
                                    <SelectTrigger id="sub_category_id" className={errors.sub_category_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih sub-kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                            <SelectGroup key={groupName}>
                                                <SelectLabel>{groupName}</SelectLabel>
                                                {subs.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.sub_category_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. LOOPING KARDUS CRITERIA SECARA DINAMIS */}
                    {data.criteria.map((item, index) => (
                        <Card key={item.id} className="relative border-l-4 border-l-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-lg">Kriteria #{index + 1}</CardTitle>
                                </div>
                                {data.criteria.length > 1 && (
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => removeCriteriaRow(index)}
                                    >
                                        Hapus Baris
                                    </Button>
                                )}
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Kode Kriteria <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={item.code}
                                            onChange={(e) => updateCriteriaField(index, 'code', e.target.value)}
                                            placeholder="e.g., KP-01"
                                            className={errors[`criteria.${index}.code`] ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors[`criteria.${index}.code`]} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Urutan Tampil</Label>
                                        <Input
                                            type="number"
                                            value={item.sort_order}
                                            onChange={(e) => updateCriteriaField(index, 'sort_order', e.target.value)}
                                            placeholder="Otomatis jika kosong"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Pertanyaan <span className="text-destructive">*</span></Label>
                                    <Textarea
                                        value={item.question}
                                        onChange={(e) => updateCriteriaField(index, 'question', e.target.value)}
                                        placeholder="Tuliskan pertanyaan kriteria penilaian..."
                                        rows={2}
                                        className={errors[`criteria.${index}.question`] ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors[`criteria.${index}.question`]} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Deskripsi (Opsional)</Label>
                                    <Textarea
                                        value={item.description}
                                        onChange={(e) => updateCriteriaField(index, 'description', e.target.value)}
                                        placeholder="Penjelasan detail..."
                                        rows={2}
                                    />
                                </div>

                                {/* BAGIAN DYNAMIC INPUT INTEGRATION */}
                                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label>Tipe Jawaban <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={item.answer_type}
                                            onValueChange={(val) => updateCriteriaField(index, 'answer_type', val)}
                                        >
                                            <SelectTrigger className={errors[`criteria.${index}.answer_type`] ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="boolean">Ya / Tidak</SelectItem>
                                                <SelectItem value="scale">Skala 1-5</SelectItem>
                                                <SelectItem value="text">Teks Bebas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors[`criteria.${index}.answer_type`]} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bobot <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.weight}
                                            onChange={(e) => updateCriteriaField(index, 'weight', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Preview Komponen dari DynamicInput */}
                                {item.answer_type && (
                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold mb-2 text-muted-foreground">Live Preview Form Input:</p>
                                        <AnswerTypePreview answerType={item.answer_type} />
                                    </div>
                                )}

                                {/* Toggles Requirements */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Wajib Lampiran</Label>
                                        <Switch
                                            checked={item.requires_attachment}
                                            onCheckedChange={(checked) => updateCriteriaField(index, 'requires_attachment', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Status Aktif</Label>
                                        <Switch
                                            checked={item.is_active}
                                            onCheckedChange={(checked) => updateCriteriaField(index, 'is_active', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Tombol Tambah Barid Baru */}
                    <Button type="button" variant="outline" className="w-full dashed border-2" onClick={addCriteriaRow}>
                        + Tambah Kriteria Lainnya
                    </Button>

                    {/* Actions Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('admin.criteria.index')}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : `Simpan ${data.criteria.length} Kriteria`}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}