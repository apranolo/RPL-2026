import DocumentVersionList, { RevisionRoundItem } from '@/components/DocumentVersionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type JournalAssessment } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, FileUp, Send, Trash2, UploadCloud, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipe lokal
// ---------------------------------------------------------------------------

interface RevisionRoundDetail extends RevisionRoundItem {
    journal_assessment_id: number;
    requested_at?: string;
    requester?: { id: number; name: string };
}

interface UploadRevisionProps {
    revisionRound: RevisionRoundDetail;
    assessment: JournalAssessment;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png'];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

function humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mime }: { mime: string }) {
    if (mime === 'application/pdf') {
        return (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-600">
                PDF
            </span>
        );
    }
    if (mime.startsWith('image/')) {
        return (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">
                IMG
            </span>
        );
    }
    return (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
            DOC
        </span>
    );
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

/**
 * UploadRevision
 *
 * Halaman form untuk Author mengunggah file revisi pada ronde revisi tertentu.
 * Mendukung drag-and-drop dan pemilihan file manual. Author dapat menyimpan
 * file tanpa mengirim, atau langsung mengirim revisi sekaligus.
 */
export default function UploadRevision({ revisionRound, assessment }: UploadRevisionProps) {
    // -------------------------------------------------------------------------
    // Breadcrumbs
    // -------------------------------------------------------------------------
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: route('user.assessments.index') },
        { title: assessment.journal?.title ?? `Assessment #${assessment.id}`, href: route('user.assessments.show', assessment.id) },
        { title: `Upload Revisi — Ronde ${revisionRound.round_number}`, href: '#' },
    ];

    // -------------------------------------------------------------------------
    // Inertia form
    // -------------------------------------------------------------------------
    const { data, setData, post, processing, errors, reset } = useForm<{
        files: File[];
        notes: string;
        submit_revision: boolean;
    }>({
        files: [],
        notes: '',
        submit_revision: false,
    });

    // -------------------------------------------------------------------------
    // State lokal untuk file yang dipilih (preview sebelum upload)
    // -------------------------------------------------------------------------
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `${file.name}: format tidak didukung (hanya PDF, DOC, DOCX, JPG, PNG).`;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `${file.name}: ukuran melebihi batas ${MAX_FILE_SIZE_MB} MB.`;
        }
        return null;
    };

    const addFiles = useCallback(
        (incoming: FileList | File[]) => {
            const newFiles = Array.from(incoming);
            const errs: string[] = [];
            const valid: File[] = [];

            for (const f of newFiles) {
                const err = validateFile(f);
                if (err) {
                    errs.push(err);
                } else if (selectedFiles.length + valid.length < MAX_FILES) {
                    valid.push(f);
                } else {
                    errs.push(`Maksimal ${MAX_FILES} file per pengiriman.`);
                    break;
                }
            }

            setFileErrors(errs);
            const updated = [...selectedFiles, ...valid];
            setSelectedFiles(updated);
            setData('files', updated);
        },
        [selectedFiles, setData],
    );

    const removeFile = (idx: number) => {
        const updated = selectedFiles.filter((_, i) => i !== idx);
        setSelectedFiles(updated);
        setData('files', updated);
    };

    // -------------------------------------------------------------------------
    // Drop zone handlers
    // -------------------------------------------------------------------------
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------
    const handleSubmit = (submitNow: boolean) => (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            setFileErrors(['Pilih minimal satu file sebelum mengunggah.']);
            return;
        }

        setData('submit_revision', submitNow);

        // Gunakan FormData agar file ikut terkirim
        post(route('user.revisions.upload', revisionRound.id), {
            forceFormData: true,
        });
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    const journal = assessment.journal;
    const existingFiles = revisionRound.submission_files ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                {/* ---- Header info ronde ---- */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">
                        Upload File Revisi
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ronde&nbsp;
                        <span className="font-semibold text-foreground">
                            {revisionRound.round_number}
                        </span>
                        &nbsp;—&nbsp;
                        {journal?.title ?? `Assessment #${assessment.id}`}
                    </p>
                </div>

                {/* ---- Catatan permintaan revisi dari penilai ---- */}
                {revisionRound.request_notes && (
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Catatan Penilai</p>
                            <p className="mt-0.5 text-sm text-amber-700">{revisionRound.request_notes}</p>
                        </div>
                    </div>
                )}

                {/* ---- Form upload ---- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileUp className="h-4 w-4" aria-hidden="true" />
                            Unggah File Revisi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(false)} encType="multipart/form-data" className="space-y-5">
                            {/* Drop zone */}
                            <div
                                id="dropzone-revisi"
                                role="button"
                                tabIndex={0}
                                aria-label="Area drag-and-drop file"
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                                    dragOver
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/60 hover:bg-muted/40'
                                }`}
                            >
                                <UploadCloud
                                    className={`h-10 w-10 transition-colors ${dragOver ? 'text-primary' : 'text-muted-foreground'}`}
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Seret file ke sini atau klik untuk memilih
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        PDF, DOC, DOCX, JPG, PNG — maks. {MAX_FILE_SIZE_MB} MB per file, maks. {MAX_FILES} file
                                    </p>
                                </div>
                                <input
                                    ref={inputRef}
                                    id="input-file-revisi"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                                    aria-label="Pilih file revisi"
                                />
                            </div>

                            {/* Error validasi file lokal */}
                            {fileErrors.length > 0 && (
                                <ul className="space-y-1">
                                    {fileErrors.map((err, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-destructive">
                                            <X className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Error dari server */}
                            {errors.files && (
                                <p className="text-sm text-destructive">{errors.files}</p>
                            )}

                            {/* Daftar file yang dipilih */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        File dipilih ({selectedFiles.length}/{MAX_FILES})
                                    </p>
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                                        >
                                            <FileTypeIcon mime={file.type} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {humanSize(file.size)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                aria-label={`Hapus ${file.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Catatan tambahan */}
                            <div className="space-y-1.5">
                                <Label htmlFor="notes-revisi">Catatan (opsional)</Label>
                                <Textarea
                                    id="notes-revisi"
                                    placeholder="Tambahkan keterangan tentang perubahan yang dilakukan…"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    aria-describedby={errors.notes ? 'notes-error' : undefined}
                                />
                                {errors.notes && (
                                    <p id="notes-error" className="text-xs text-destructive">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>

                            {/* Tombol aksi */}
                            <div className="flex flex-wrap gap-3 pt-1">
                                {/* Simpan tanpa kirim */}
                                <Button
                                    id="btn-simpan-revisi"
                                    type="submit"
                                    variant="outline"
                                    disabled={processing || selectedFiles.length === 0}
                                >
                                    <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Simpan File
                                </Button>

                                {/* Kirim revisi sekaligus */}
                                <Button
                                    id="btn-kirim-revisi"
                                    type="button"
                                    disabled={processing || selectedFiles.length === 0}
                                    onClick={handleSubmit(true)}
                                >
                                    <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {processing ? 'Mengirim…' : 'Kirim Revisi'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* ---- File yang sudah diunggah di ronde ini ---- */}
                {existingFiles.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                File Sudah Diunggah ({existingFiles.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {existingFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                                >
                                    <FileTypeIcon mime={file.mime_type ?? ''} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium" title={file.original_filename}>
                                            {file.original_filename}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {file.file_size_human} &bull; {file.uploader?.name ?? 'Author'}
                                        </p>
                                    </div>
                                    {file.download_url && (
                                        <a
                                            href={file.download_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.original_filename}
                                            className="flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                                            aria-label={`Unduh ${file.original_filename}`}
                                        >
                                            <span className="sr-only">Unduh</span>
                                            <FileUp className="h-4 w-4 rotate-180" aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* ---- Histori versi semua ronde (DocumentVersionList) ---- */}
                <DocumentVersionList
                    revisionRounds={[revisionRound]}
                    className="mt-2"
                />
            </div>
        </AppLayout>
    );
}
