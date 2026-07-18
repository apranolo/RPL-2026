import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, BookOpen, FileText, Globe, HelpCircle, Sparkles, Upload, User } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

export type BookFormData = {
    judul_luaran: string;
    isbn: string;
    tahun_capaian: string;
    penulis_atau_pencipta: string;
    tipe_buku: string;
    tautan_publikasi: string;
    deskripsi: string;
    file_sertifikat_atau_cover: File | null;
} & Record<string, any>;

interface Props {
    submitUrl: string;
    cancelUrl: string;
    initialData?: Partial<BookFormData>;
    isEdit?: boolean;
}

export default function BookForm({
    submitUrl,
    cancelUrl,
    initialData,
    isEdit = false,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<BookFormData>({
        judul_luaran: initialData?.judul_luaran || '',
        isbn: initialData?.isbn || '',
        tahun_capaian: initialData?.tahun_capaian || new Date().getFullYear().toString(),
        penulis_atau_pencipta: initialData?.penulis_atau_pencipta || '',
        tipe_buku: initialData?.tipe_buku || 'Buku Ajar',
        tautan_publikasi: initialData?.tautan_publikasi || '',
        deskripsi: initialData?.deskripsi || '',
        file_sertifikat_atau_cover: null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(submitUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, i) => (currentYear + 2 - i).toString());

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');

    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const hasErrors = Object.keys(errors).length > 0;

    useEffect(() => {
        if (hasErrors && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [hasErrors]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Summary */}
            {hasErrors && (
                <div ref={errorSummaryRef}>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Terdapat kesalahan pada form</AlertTitle>
                        <AlertDescription>
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message as string}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                            Sub-Form Luaran: Buku / Modul
                            <Sparkles className="h-4 w-4 text-amber-500" />
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            Lengkapi informasi publikasi buku, modul, atau monograf penelitian. Pastikan ISBN valid.
                        </p>
                    </div>
                </div>
            </div>

            {/* Informasi Buku */}
            <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                    Informasi Buku
                </h3>

                {/* Judul Buku */}
                <div>
                    <Label htmlFor="judul_luaran">
                        Judul Buku / Modul <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="judul_luaran"
                        value={data.judul_luaran}
                        onChange={(e) => setData('judul_luaran', e.target.value)}
                        placeholder="Contoh: Metodologi Penelitian Modern dan Implementasinya"
                        className="mt-1"
                        required
                    />
                    {errors.judul_luaran && <p className="mt-1 text-sm text-red-600">{errors.judul_luaran}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* ISBN */}
                    <div>
                        <Label htmlFor="isbn" className="flex items-center gap-1">
                            ISBN <span className="text-red-500">*</span>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </Label>
                        <Input
                            id="isbn"
                            value={data.isbn}
                            onChange={(e) => setData('isbn', e.target.value)}
                            placeholder="978-602-1234-56-7"
                            className="mt-1"
                            required
                        />
                        <p className="mt-1 text-xs text-muted-foreground">International Standard Book Number (ISBN-13)</p>
                        {errors.isbn && <p className="mt-1 text-sm text-red-600">{errors.isbn}</p>}
                    </div>

                    {/* Tipe Buku */}
                    <div>
                        <Label>
                            Kategori / Tipe Buku <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.tipe_buku} onValueChange={(val) => setData('tipe_buku', val)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pilih Kategori Buku" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Buku Ajar">Buku Ajar</SelectItem>
                                <SelectItem value="Monograf">Monograf</SelectItem>
                                <SelectItem value="Buku Referensi">Buku Referensi</SelectItem>
                                <SelectItem value="Buku Panduan">Buku Panduan</SelectItem>
                                <SelectItem value="Modul Praktikum">Modul Praktikum</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.tipe_buku && <p className="mt-1 text-sm text-red-600">{errors.tipe_buku}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Penulis */}
                    <div>
                        <Label htmlFor="penulis_atau_pencipta" className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Penulis / Co-Authors <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="penulis_atau_pencipta"
                            value={data.penulis_atau_pencipta}
                            onChange={(e) => setData('penulis_atau_pencipta', e.target.value)}
                            placeholder="Prof. Dr. Faiz, M.T., Dr. Ahmad, M.Cs."
                            className="mt-1"
                            required
                        />
                        {errors.penulis_atau_pencipta && <p className="mt-1 text-sm text-red-600">{errors.penulis_atau_pencipta}</p>}
                    </div>

                    {/* Tahun Capaian */}
                    <div>
                        <Label>
                            Tahun Terbit / Capaian <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.tahun_capaian} onValueChange={(val) => setData('tahun_capaian', val)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tahun_capaian && <p className="mt-1 text-sm text-red-600">{errors.tahun_capaian}</p>}
                    </div>
                </div>

                {/* Tautan Publikasi */}
                <div>
                    <Label htmlFor="tautan_publikasi" className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Tautan Katalog / Google Books / DOI (Opsional)
                    </Label>
                    <Input
                        id="tautan_publikasi"
                        type="url"
                        value={data.tautan_publikasi}
                        onChange={(e) => setData('tautan_publikasi', e.target.value)}
                        placeholder="https://books.google.co.id/books?id=..."
                        className="mt-1"
                    />
                    {errors.tautan_publikasi && <p className="mt-1 text-sm text-red-600">{errors.tautan_publikasi}</p>}
                </div>

                {/* Deskripsi */}
                <div>
                    <Label htmlFor="deskripsi">Sinopsis / Deskripsi Singkat Buku</Label>
                    <Textarea
                        id="deskripsi"
                        rows={3}
                        value={data.deskripsi}
                        onChange={(e) => setData('deskripsi', e.target.value)}
                        placeholder="Tuliskan deskripsi singkat mengenai isi buku atau topik utama yang diulas..."
                        className="mt-1"
                        maxLength={1000}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{data.deskripsi.length}/1000 karakter</p>
                    {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
                </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                    Dokumen Pendukung
                </h3>

                <div>
                    <Label className="flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                        Unggah Cover / Sertifikat Penerbit <span className="text-red-500">*</span>
                    </Label>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-amber-400 hover:bg-amber-50/30 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-amber-600 dark:hover:bg-amber-950/10"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) {
                                    setData('file_sertifikat_atau_cover', file);
                                    setFileName(file.name);
                                }
                            }}
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {fileName || 'Klik untuk memilih file'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            PDF, PNG, JPG, atau JPEG — Maksimal 5MB
                        </p>
                    </div>
                    {errors.file_sertifikat_atau_cover && (
                        <p className="mt-1 text-sm text-red-600">{errors.file_sertifikat_atau_cover}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t pt-4 sm:flex-row sm:items-center dark:border-gray-700">
                <Link href={cancelUrl}>
                    <Button type="button" variant="outline">
                        Batal
                    </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : isEdit ? 'Update Buku' : 'Simpan Luaran Buku'}
                </Button>
            </div>
        </form>
    );
}
