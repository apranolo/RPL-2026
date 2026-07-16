/**
 * Progress/Create.tsx
 *
 * Halaman form upload Laporan Kemajuan untuk Dosen.
 *
 * @route GET /dosen/progress/create
 * @features
 *   - Input judul, periode, tanggal laporan
 *   - WYSIWYG RichTextEditor untuk isi / deskripsi laporan
 *   - WYSIWYG RichTextEditor untuk catatan logbook
 *   - Upload dokumen laporan (PDF/DOC/DOCX)
 *   - Upload file logbook (PDF/DOC/DOCX/XLS/XLSX)
 *   - Simpan sebagai draft atau langsung submit
 */
import type { InertiaFormProps } from '@inertiajs/react';
import RichTextEditor from '@/components/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    FileText,
    FileUp,
    Loader2,
    Save,
    Send,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    user: User;
}

// Hanya string di sini — File tidak boleh masuk useForm karena merusak
// inferensi tipe `errors` (semua key jadi `never`).
// File dikelola terpisah via useState dan digabungkan saat router.post.
interface ProgressFormData {
    judul: string;
    periode: string;
    tanggal_laporan: string;
    deskripsi: string;
    catatan: string;
    status: string;
    dokumen_laporan: File | null;
    logbook: File | null;
}

/* ------------------------------------------------------------------ */
/*  File upload helpers                                                 */
/* ------------------------------------------------------------------ */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_DOC = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_LOG = [...ALLOWED_DOC, 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

function validateFile(file: File, allowedTypes: string[]): string | null {
    if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: Ukuran melebihi 10 MB (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    }
    if (!allowedTypes.includes(file.type)) {
        return `${file.name}: Format tidak didukung`;
    }
    return null;
}

function humanFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/* ------------------------------------------------------------------ */
/*  FileDropZone sub-component                                          */
/* ------------------------------------------------------------------ */

interface FileDropZoneProps {
    id: string;
    label: string;
    accept: string;
    hint: string;
    file: File | null;
    error?: string;
    onSelect: (file: File | null) => void;
    allowedTypes: string[];
}

function FileDropZone({ id, label, accept, hint, file, error, onSelect, allowedTypes }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (candidate: File) => {
        const err = validateFile(candidate, allowedTypes);
        if (err) {
            toast.error('File tidak valid', { description: err });
            return;
        }
        onSelect(candidate);
        toast.success('File siap diunggah', { description: candidate.name });
    };

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>

            <div
                className={[
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
                    dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60',
                    error ? 'border-destructive/60' : '',
                ].join(' ')}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) handleFile(dropped);
                }}
            >
                {file ? (
                    <div className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate font-medium">{file.name}</span>
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                                {humanFileSize(file.size)}
                            </Badge>
                        </div>
                        <button
                            type="button"
                            className="ml-2 shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                            aria-label="Hapus file"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Drag &amp; drop atau <span className="font-semibold text-primary">klik untuk pilih file</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    </>
                )}
            </div>

            <input
                id={id}
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                }}
            />

            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function ProgressCreate({ user }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);

    // File dikelola via useState (BUKAN useForm) agar tipe errors tetap bersih
    const [dokumenLaporan, setDokumenLaporan] = useState<File | null>(null);
    const [logbookFile, setLogbookFile] = useState<File | null>(null);

  const form = useForm<{
    judul: string;
    periode: string;
    tanggal_laporan: string;
    deskripsi: string;
    catatan: string;
    status: string;
    dokumen_laporan: File | null;
    logbook: File | null;
}>({
    judul: '',
    periode: '',
    tanggal_laporan: new Date().toISOString().split('T')[0],
    deskripsi: '',
    catatan: '',
    status: 'draft',
    dokumen_laporan: null,
    logbook: null,
});

const { data, setData, errors, setError, clearErrors, processing } = form;

    /* ── Submit ── */
    const handleSubmit = (submitStatus: 'draft' | 'submitted') => {
        clearErrors();

        // Gabungkan form data (string) + files (File|null) + status saat submit
        router.post(
            route('progress.store'),
             {
                ...data,
                status: submitStatus,
                dokumen_laporan: dokumenLaporan,
                logbook: logbookFile,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setIsProcessing(true),
                onFinish: () => setIsProcessing(false),
                onSuccess: () => {
                    toast.success(
                        submitStatus === 'draft'
                            ? 'Laporan disimpan sebagai draft.'
                            : 'Laporan berhasil disubmit!',
                    );
                },
                onError: (errs) => {
                    setError(errs as Record<keyof ProgressFormData, string>);
                    toast.error('Terdapat kesalahan. Periksa kembali formulir Anda.');
                },
            },
        );
    };

    /* ── Render ── */
    return (
        <AppLayout>
            <Head title="Buat Laporan Kemajuan" />

            <div className="mx-auto max-w-4xl space-y-6 pb-16">

                {/* ── Header ── */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>Laporan Kemajuan</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Buat Laporan Kemajuan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Lengkapi formulir di bawah. Anda dapat menyimpan sebagai draft terlebih dahulu.
                    </p>
                </div>

                {/* ── Informasi Dasar ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Informasi Dasar
                        </CardTitle>
                        <CardDescription>Judul, periode, dan tanggal laporan kemajuan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Judul */}
                        <div className="space-y-1.5">
                            <Label htmlFor="judul">
                                Judul Laporan <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="judul"
                                name="judul"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                placeholder="Contoh: Laporan Kemajuan Penelitian Semester Ganjil 2025"
                                disabled={isProcessing}
                            />
                            {errors.judul && (
                                <p className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" /> {errors.judul}
                                </p>
                            )}
                        </div>

                        {/* Periode & Tanggal */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="periode">
                                    Periode <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.periode}
                                    onValueChange={(v) => setData('periode', v)}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger id="periode">
                                        <SelectValue placeholder="Pilih periode..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semester Ganjil 2025">Semester Ganjil 2025</SelectItem>
                                        <SelectItem value="Semester Genap 2025">Semester Genap 2025</SelectItem>
                                        <SelectItem value="Semester Ganjil 2026">Semester Ganjil 2026</SelectItem>
                                        <SelectItem value="Semester Genap 2026">Semester Genap 2026</SelectItem>
                                        <SelectItem value="Triwulan 1 2025">Triwulan 1 2025</SelectItem>
                                        <SelectItem value="Triwulan 2 2025">Triwulan 2 2025</SelectItem>
                                        <SelectItem value="Triwulan 3 2025">Triwulan 3 2025</SelectItem>
                                        <SelectItem value="Triwulan 4 2025">Triwulan 4 2025</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.periode && (
                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3" /> {errors.periode}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="tanggal_laporan">
                                    Tanggal Laporan <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tanggal_laporan"
                                    type="date"
                                    value={data.tanggal_laporan}
                                    onChange={(e) => setData('tanggal_laporan', e.target.value)}
                                    disabled={isProcessing}
                                />
                                {errors.tanggal_laporan && (
                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3" /> {errors.tanggal_laporan}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nama Dosen (read-only) */}
                        <div className="space-y-1.5">
                            <Label>Dosen Pelapor</Label>
                            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-muted-foreground">({user.email})</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* ── Deskripsi / Isi Laporan (WYSIWYG) ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-primary" />
                            Deskripsi Laporan
                        </CardTitle>
                        <CardDescription>
                            Uraikan kemajuan penelitian, capaian, kendala, dan rencana tindak lanjut
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Label>
                            Isi Laporan <span className="text-destructive">*</span>
                        </Label>
                        <RichTextEditor
                            id="deskripsi"
                            value={data.deskripsi}
                            onChange={(html) => setData('deskripsi', html)}
                            placeholder="Tuliskan deskripsi kemajuan penelitian Anda..."
                            minHeight="min-h-[240px]"
                            disabled={isProcessing}
                        />
                        {errors.deskripsi && (
                            <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" /> {errors.deskripsi}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Catatan / Logbook (WYSIWYG) ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Catatan Logbook
                        </CardTitle>
                        <CardDescription>
                            Catatan harian / mingguan kegiatan penelitian (opsional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Label htmlFor="catatan">Isi Logbook</Label>
                        <RichTextEditor
                            id="catatan"
                            value={data.catatan}
                            onChange={(html) => setData('catatan', html)}
                            placeholder="Catat aktivitas penelitian harian/mingguan Anda di sini..."
                            minHeight="min-h-[180px]"
                            disabled={isProcessing}
                        />
                        {errors.catatan && (
                            <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" /> {errors.catatan}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Upload Dokumen ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileUp className="h-4 w-4 text-primary" />
                            Upload Dokumen
                        </CardTitle>
                        <CardDescription>
                            Unggah dokumen laporan dan file logbook pendukung
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Dokumen Laporan */}
                        <FileDropZone
                            id="dokumen_laporan"
                            label="Dokumen Laporan (PDF / DOC / DOCX)"
                            accept=".pdf,.doc,.docx"
                            hint="PDF, DOC, DOCX — maks 10 MB"
                            file={dokumenLaporan}
                            error={errors.dokumen_laporan}
                            allowedTypes={ALLOWED_DOC}
                            onSelect={setDokumenLaporan}
                        />

                        <Separator />

                        {/* File Logbook */}
                        <FileDropZone
                            id="logbook"
                            label="File Logbook (PDF / DOC / DOCX / XLS / XLSX)"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            hint="PDF, DOC, DOCX, XLS, XLSX — maks 10 MB"
                            file={logbookFile}
                            error={errors.logbook}
                            allowedTypes={ALLOWED_LOG}
                            onSelect={setLogbookFile}
                        />

                    </CardContent>
                </Card>

                {/* ── Action Buttons ── */}
                <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/95 py-4 backdrop-blur">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.visit(route('progress.index'))}
                        disabled={isProcessing}
                    >
                        Batal
                    </Button>

                    <div className="flex items-center gap-2">
                        {/* Simpan Draft */}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => handleSubmit('draft')}
                        >
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Simpan Draft
                        </Button>

                        {/* Submit */}
                        <Button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                                if (!data.judul || !data.periode || !data.deskripsi) {
                                    toast.error('Lengkapi semua field wajib sebelum submit.');
                                    return;
                                }
                                if (confirm('Yakin ingin submit laporan ini? Status tidak dapat dikembalikan ke draft.')) {
                                    handleSubmit('submitted');
                                }
                            }}
                        >
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Laporan
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
