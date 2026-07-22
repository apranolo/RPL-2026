import { FilePreview } from '@/components/FilePreview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductFormData = {
    title: string;
    description: string;
    category: string;
    tkt_level: string;
    version: string;
    year: string;
    url: string;
    status: string;
    cover_image: File | null;
    document: File | null;
    _method?: 'put';
};

interface Props {
    /** Route to POST the form data to */
    submitUrl: string;
    /** URL to navigate to when user cancels */
    cancelUrl: string;
    /** Pre-filled data when editing an existing record */
    initialData?: Partial<ProductFormData>;
    /** Existing cover image URL (for edit mode) */
    currentCover?: string | null;
    /** Existing document URL (for edit mode) */
    currentDocument?: string | null;
    /** Whether this form is used in edit mode */
    isEdit?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRENT_YEAR = new Date().getFullYear();

const TKT_LEVELS: Array<{ value: string; label: string; description: string }> = [
    { value: '1', label: 'TKT 1', description: 'Prinsip dasar diamati dan dilaporkan' },
    { value: '2', label: 'TKT 2', description: 'Konsep teknologi atau aplikasi dirumuskan' },
    { value: '3', label: 'TKT 3', description: 'Bukti konsep secara analitis & eksperimental' },
    { value: '4', label: 'TKT 4', description: 'Komponen tervalidasi di laboratorium' },
    { value: '5', label: 'TKT 5', description: 'Komponen tervalidasi di lingkungan relevan' },
    { value: '6', label: 'TKT 6', description: 'Sistem/prototipe terdemonstrasikan di lingkungan relevan' },
    { value: '7', label: 'TKT 7', description: 'Demonstrasi prototipe dalam lingkungan operasional' },
    { value: '8', label: 'TKT 8', description: 'Sistem sempurna & terukualifikasi' },
    { value: '9', label: 'TKT 9', description: 'Sistem terbukti berhasil dalam lingkungan operasional' },
];

const PRODUCT_CATEGORIES = [
    'Perangkat Lunak',
    'Perangkat Keras',
    'Alat / Instrumen',
    'Material / Bahan',
    'Prototipe Mekanik',
    'Sistem Embedded',
    'Aplikasi Mobile',
    'Aplikasi Web',
    'Model / Desain',
    'Lainnya',
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Dipublikasikan' },
    { value: 'patented', label: 'Sudah Dipatenkan' },
];


// ---------------------------------------------------------------------------
// ProductForm
// ---------------------------------------------------------------------------

export default function ProductForm({ submitUrl, cancelUrl, initialData, currentCover = null, currentDocument = null, isEdit = false }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<ProductFormData>({
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        category: initialData?.category ?? '',
        tkt_level: initialData?.tkt_level ?? '',
        version: initialData?.version ?? '',
        year: initialData?.year ?? String(CURRENT_YEAR),
        url: initialData?.url ?? '',
        status: initialData?.status ?? 'draft',
        cover_image: null,
        document: null,
        ...(isEdit ? { _method: 'put' as const } : {}),
    });

    // ---- Error summary scroll ----
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const hasErrors = Object.keys(errors).length > 0;

    useEffect(() => {
        if (hasErrors && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [hasErrors]);

    // ---- Handlers ----
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(submitUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) reset();
            },
        });
    };

    // ---- Render ----
    return (

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Error Summary ── */}
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

            {/* ── Section 1: Informasi Umum ── */}
            <section className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                    Informasi Produk / Prototipe
                </h3>

                {/* Title */}
                <div>
                    <Label htmlFor="product-title">
                        Judul Produk / Prototipe <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="product-title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Prototipe Alat Monitoring Kualitas Air Berbasis IoT"
                        className="mt-1"
                        required
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="product-description">
                        Deskripsi <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="product-description"
                        rows={4}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Jelaskan produk/prototipe secara singkat dan jelas..."
                        className="mt-1"
                        maxLength={2000}
                        required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{data.description.length}/2000 karakter</p>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="product-category">
                            Kategori <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                            <SelectTrigger id="product-category" className="mt-1">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                        <Label htmlFor="product-status">
                            Status <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger id="product-status" className="mt-1">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                    </div>
                </div>

                {/* Version & Year */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="product-version">Versi</Label>
                        <Input
                            id="product-version"
                            value={data.version}
                            onChange={(e) => setData('version', e.target.value)}
                            placeholder="e.g. v1.0.0"
                            className="mt-1"
                            maxLength={50}
                        />
                        {errors.version && <p className="mt-1 text-sm text-red-600">{errors.version}</p>}
                    </div>

                    <div>
                        <Label htmlFor="product-year">
                            Tahun <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="product-year"
                            type="number"
                            min={2000}
                            max={CURRENT_YEAR + 1}
                            value={data.year}
                            onChange={(e) => setData('year', e.target.value)}
                            placeholder={String(CURRENT_YEAR)}
                            className="mt-1"
                            required
                        />
                        {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                    </div>
                </div>

                {/* URL */}
                <div>
                    <Label htmlFor="product-url">URL / Tautan Demo (Opsional)</Label>
                    <Input
                        id="product-url"
                        type="url"
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                        placeholder="https://demo.example.com/produk-saya"
                        className="mt-1"
                    />
                    {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                </div>
            </section>

            {/* ── Section 2: TKT ── */}
            <section className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                    Tingkat Kesiapterapan Teknologi (TKT)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pilih level TKT yang menggambarkan kematangan teknologi dari produk/prototipe ini.
                </p>

                <div>
                    <Label htmlFor="product-tkt-level">
                        Level TKT <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.tkt_level} onValueChange={(val) => setData('tkt_level', val)}>
                        <SelectTrigger id="product-tkt-level" className="mt-1">
                            <SelectValue placeholder="Pilih Level TKT" />
                        </SelectTrigger>
                        <SelectContent>
                            {TKT_LEVELS.map((tkt) => (
                                <SelectItem key={tkt.value} value={tkt.value}>
                                    <span className="font-medium">{tkt.label}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">– {tkt.description}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.tkt_level && <p className="mt-1 text-sm text-red-600">{errors.tkt_level}</p>}
                </div>

                {/* TKT Level Detail badge */}
                {data.tkt_level && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                        {TKT_LEVELS.filter((t) => t.value === data.tkt_level).map((tkt) => (
                            <div key={tkt.value} className="flex items-start gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                    {tkt.value}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{tkt.label}</p>
                                    <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-300">{tkt.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Section 3: Berkas Pendukung ── */}
            <section className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">Berkas Pendukung</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Cover Image */}
                    <FilePreview
                        variant="image"
                        name="cover_image"
                        label="Gambar Cover (Opsional)"
                        description="Tampilkan cover visual produk Anda"
                        currentUrl={currentCover}
                        onChange={(file) => setData('cover_image', file)}
                        error={errors.cover_image}
                        disabled={processing}
                    />

                    {/* Proof Document */}
                    <FilePreview
                        variant="document"
                        name="document"
                        label="Dokumen Bukti (Opsional)"
                        description="Upload laporan, sertifikat, atau dokumen pendukung"
                        currentUrl={currentDocument}
                        currentName={currentDocument ? 'Dokumen saat ini' : undefined}
                        onChange={(file) => setData('document', file)}
                        error={errors.document}
                        disabled={processing}
                    />
                </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t pt-4 sm:flex-row sm:items-center dark:border-gray-700">
                <Link href={cancelUrl}>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Batal
                    </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Menyimpan...' : isEdit ? 'Perbarui Produk' : 'Simpan Produk'}
                </Button>
            </div>
        </form>
    );
}