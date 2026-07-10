import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { route } from 'ziggy-js';
import { kategoriOptions, getExtraFields, type ExtraField, type OutputMetadata } from '@/utils/OutputFormSelector';

type Output = {
    id: number;
    proposal_id: number;
    user_id: number;
    kategori: string;
    judul: string;
    link_url: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    keterangan: string | null;
    metadata: OutputMetadata | null;
    created_at: string;
    updated_at: string;
};

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

function ExtraFieldInput({
    field,
    value,
    error,
    onChange,
}: {
    field: ExtraField;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
            </Label>
            {field.type === 'textarea' ? (
                <Textarea
                    id={field.name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1"
                    rows={4}
                />
            ) : (
                <Input
                    id={field.name}
                    type={field.type === 'date' ? 'date' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1"
                />
            )}
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
    );
}

export default function Edit({ output }: { output: Output }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Research Outputs', href: route('user.outputs.index') },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        kategori: output.kategori,
        judul: output.judul,
        link_url: output.link_url ?? '',
        file: null as File | null,
        status: output.status,
        keterangan: output.keterangan ?? '',
        metadata: output.metadata ?? ({} as OutputMetadata),
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState(output.file_name ?? '');

    const [extraFields, setExtraFields] = React.useState<ExtraField[]>(() =>
        getExtraFields(data.kategori),
    );

    const handleKategoriChange = (val: string) => {
        setData('kategori', val);
        const fields = getExtraFields(val);
        setExtraFields(fields);
        const newMeta: OutputMetadata = {};
        fields.forEach((f) => {
            newMeta[f.name] = data.metadata[f.name] ?? '';
        });
        setData('metadata', newMeta);
    };

    const handleMetadataChange = (name: string, value: string) => {
        setData('metadata', { ...data.metadata, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.outputs.update', output.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Research Output" />
            <div className="py">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('user.outputs.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Luaran
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Luaran Penelitian</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Perbarui detail luaran penelitian</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Informasi Luaran Penelitian
                                </h3>

                                <div>
<Label htmlFor="judul">
                                    Judul <span className="text-destructive">*</span>
                                </Label>
                                    <Input
                                        id="judul"
                                        value={data.judul}
                                        onChange={(e) => setData('judul', e.target.value)}
                                        placeholder="Masukkan judul luaran penelitian"
                                        className="mt-1"
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-destructive">{errors.judul}</p>}
                                </div>

                                <div>
<Label htmlFor="kategori">
                                    Kategori <span className="text-destructive">*</span>
                                </Label>
                                    <Select value={data.kategori} onValueChange={handleKategoriChange}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kategoriOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {extraFields.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                            Detail {kategoriOptions.find((o) => o.value === data.kategori)?.label}
                                        </h3>
                                        {extraFields.map((field) => (
                                            <ExtraFieldInput
                                                key={field.name}
                                                field={field}
                                                value={data.metadata[field.name] ?? ''}
                                                error={errors[`metadata.${field.name}` as keyof typeof errors]}
                                                onChange={(val) => handleMetadataChange(field.name, val)}
                                            />
                                        ))}
                                    </div>
                                )}

                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Dokumen & Tautan
                                </h3>

                                <div>
                                    <Label htmlFor="link_url">Tautan Publikasi</Label>
                                    <Input
                                        id="link_url"
                                        type="url"
                                        value={data.link_url}
                                        onChange={(e) => setData('link_url', e.target.value)}
                                        placeholder="Link Google Scholar, DOAJ, atau website jurnal"
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Tempel tautan publikasi luar (URL seperti Google Scholar, DOAJ, atau website jurnal)
                                    </p>
                                    {errors.link_url && <p className="mt-1 text-sm text-destructive">{errors.link_url}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="file">Upload Dokumen</Label>
                                    <div className="mt-1 flex items-center gap-3">
                                        <input
                                            ref={fileInputRef}
                                            id="file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Pilih Berkas
                                        </Button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {fileName || 'Belum ada file dipilih'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Unggah PDF atau berkas fisik luaran (maks. 10MB)
                                    </p>
                                    {errors.file && <p className="mt-1 text-sm text-destructive">{errors.file}</p>}
                                </div>

                                <div>
<Label htmlFor="status">
                                    Status <span className="text-destructive">*</span>
                                </Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        placeholder="Informasi tambahan tentang luaran penelitian"
                                        className="mt-1"
                                    />
                                    {errors.keterangan && <p className="mt-1 text-sm text-destructive">{errors.keterangan}</p>}
                                </div>

                                <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t pt-4 sm:flex-row sm:items-center dark:border-gray-700">
                                    <Link href={route('user.outputs.index')}>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
