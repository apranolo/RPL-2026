import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Award, FileText, Globe, ShieldCheck, Upload, User } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

export type HkiFormData = {
    judul_luaran: string;
    nomor_paten: string;
    jenis_hki: string;
    tahun_capaian: string;
    penulis_atau_pencipta: string;
    tautan_publikasi: string;
    deskripsi: string;
    file_sertifikat_atau_cover: File | null;
} & Record<string, any>;

interface Props {
    submitUrl: string;
    cancelUrl: string;
    initialData?: Partial<HkiFormData>;
    isEdit?: boolean;
}

export default function HkiForm({
    submitUrl,
    cancelUrl,
    initialData,
    isEdit = false,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<HkiFormData>({
        judul_luaran: initialData?.judul_luaran || '',
        nomor_paten: initialData?.nomor_paten || '',
        jenis_hki: initialData?.jenis_hki || 'Paten',
        tahun_capaian: initialData?.tahun_capaian || new Date().getFullYear().toString(),
        penulis_atau_pencipta: initialData?.penulis_atau_pencipta || '',
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
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-400/10 blur-2xl" />
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                            Sub-Form Luaran: HKI / Paten / Hak Cipta
                            <ShieldCheck className="h-4 w-4 text-indigo-500" />
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            Formulir untuk merekam capaian Hak Kekayaan Intelektual (HKI), Paten, Hak Cipta, dan Merek Dagang.
                        </p>
                    </div>
                </div>
            </div>

            {/* Informasi HKI */}
            <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                    Informasi HKI / Paten
                </h3>

                {/* Judul HKI */}
                <div>
                    <Label htmlFor="judul_luaran">
                        Judul Inovasi / HKI <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="judul_luaran"
                        value={data.judul_luaran}
                        onChange={(e) => setData('judul_luaran', e.target.value)}
                        placeholder="Contoh: Sistem Pendeteksi Kebocoran Pipa Otomatis Berbasis IoT"
                        className="mt-1"
                        required
                    />
                    {errors.judul_luaran && <p className="mt-1 text-sm text-red-600">{errors.judul_luaran}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Nomor Paten */}
                    <div>
                        <Label htmlFor="nomor_paten">
                            Nomor Paten / Pendaftaran HKI <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nomor_paten"
                            value={data.nomor_paten}
                            onChange={(e) => setData('nomor_paten', e.target.value)}
                            placeholder="IDS000001234 atau EC0020235678"
                            className="mt-1"
                            required
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Nomor resmi dari DJKI / Kemenkumham</p>
                        {errors.nomor_paten && <p className="mt-1 text-sm text-red-600">{errors.nomor_paten}</p>}
                    </div>

                    {/* Jenis HKI */}
                    <div>
                        <Label>
                            Jenis HKI <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.jenis_hki} onValueChange={(val) => setData('jenis_hki', val)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pilih Jenis HKI" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Paten">Paten</SelectItem>
                                <SelectItem value="Paten Sederhana">Paten Sederhana</SelectItem>
                                <SelectItem value="Hak Cipta">Hak Cipta</SelectItem>
                                <SelectItem value="Merek">Merek</SelectItem>
                                <SelectItem value="Desain Industri">Desain Industri</SelectItem>
                                <SelectItem value="Perlindungan Varietas Tanaman">Perlindungan Varietas Tanaman (PVT)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.jenis_hki && <p className="mt-1 text-sm text-red-600">{errors.jenis_hki}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Pencipta / Inventor */}
                    <div>
                        <Label htmlFor="penulis_atau_pencipta" className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Pencipta / Inventor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="penulis_atau_pencipta"
                            value={data.penulis_atau_pencipta}
                            onChange={(e) => setData('penulis_atau_pencipta', e.target.value)}
                            placeholder="Dr. Budi Santoso, M.T., Lutfi Hakim, S.T."
                            className="mt-1"
                            required
                        />
                        {errors.penulis_atau_pencipta && <p className="mt-1 text-sm text-red-600">{errors.penulis_atau_pencipta}</p>}
                    </div>

                    {/* Tahun Capaian */}
                    <div>
                        <Label>
                            Tahun Terdaftar / Capaian <span className="text-red-500">*</span>
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
                        Tautan PDKI / Publikasi Resmi HKI (Opsional)
                    </Label>
                    <Input
                        id="tautan_publikasi"
                        type="url"
                        value={data.tautan_publikasi}
                        onChange={(e) => setData('tautan_publikasi', e.target.value)}
                        placeholder="https://pdki-indonesia.dgip.go.id/detail/..."
                        className="mt-1"
                    />
                    {errors.tautan_publikasi && <p className="mt-1 text-sm text-red-600">{errors.tautan_publikasi}</p>}
                </div>

                {/* Deskripsi */}
                <div>
                    <Label htmlFor="deskripsi">Deskripsi Ringkas Inovasi &amp; Manfaat HKI</Label>
                    <Textarea
                        id="deskripsi"
                        rows={3}
                        value={data.deskripsi}
                        onChange={(e) => setData('deskripsi', e.target.value)}
                        placeholder="Jelaskan secara ringkas mengenai inovasi yang dilindungi, klaim penting, serta kegunaan praktisnya..."
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
                        Unggah Bukti Sertifikat HKI <span className="text-red-500">*</span>
                    </Label>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/10"
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
                    {processing ? 'Menyimpan...' : isEdit ? 'Update HKI' : 'Simpan Luaran HKI'}
                </Button>
            </div>
        </form>
    );
}
