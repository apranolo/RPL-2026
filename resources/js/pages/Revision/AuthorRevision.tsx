import InputError from '@/components/input-error';
import RevisionNotePanel from '@/components/RevisionNotePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
// import DocumentVersionList from '@/components/DocumentVersionList'; // Komponen milik M. Aulia Luthfi
import { CalendarClock, History, Info, Send, UploadCloud } from 'lucide-react';
import { useState, type FormEvent } from 'react';

/**
 * Interface di bawah idealnya diimpor dari modul type bersama tim (Modul 2 & 5).
 * Dideklarasikan lokal agar file ini mandiri & lolos type-check; pastikan
 * bentuknya sama persis dengan definisi tim agar tidak terjadi mismatch.
 */
interface SubmissionFile {
    id: number;
    id_submission: number;
    file_path: string;
    file_type: 'ManuscriptMain' | 'Supplementary';
    file_size: number;
    created_at: string;
}

// Subset field Submission (Modul 2) yang dipakai halaman ini.
interface Submission {
    id: number;
    title: string | null;
    journal?: { name: string };
}

interface RevisionRound {
    id: number;
    id_submission: number;
    round_number: number;
    editor_decision_note: string; // instruksi perbaikan dari editor
    due_date: string;
    status: 'Awaiting_Revision' | 'Submitted' | 'Approved' | 'Rejected';
    created_at: string;
}

interface AuthorRevisionProps extends PageProps {
    submission: Submission;
    currentRound: RevisionRound;
    fileHistory: SubmissionFile[];
}

// Batas unggahan sesuai spec §3.A.3 (PDF/DOCX, maks 20MB).
const MAX_FILE_MB = 20;
const ALLOWED_EXT = ['pdf', 'docx'];

// Warna badge status mengikuti Global UI/UX Guide bag. 3 (Status Badges).
const STATUS_STYLE: Record<RevisionRound['status'], string> = {
    Awaiting_Revision: 'bg-amber-50 text-amber-800 border-amber-200',
    Submitted: 'bg-slate-100 text-slate-800 border-slate-200',
    Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
};

const STATUS_LABEL: Record<RevisionRound['status'], string> = {
    Awaiting_Revision: 'Menunggu Revisi',
    Submitted: 'Revisi Terkirim',
    Approved: 'Disetujui',
    Rejected: 'Ditolak',
};

// Pesan ketika ronde revisi sudah tidak menerima unggahan lagi.
const CLOSED_MESSAGE: Partial<Record<RevisionRound['status'], string>> = {
    Submitted: 'Berkas revisi sudah kamu ajukan dan sedang menunggu penilaian editor.',
    Approved: 'Revisi ronde ini telah disetujui editor. Tidak ada tindakan lanjutan.',
    Rejected: 'Revisi ronde ini ditolak editor.',
};

export default function AuthorRevision({ submission, currentRound, fileHistory }: AuthorRevisionProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Naskah Saya', href: '/submissions' },
        { title: 'Perbaikan Naskah', href: '#' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<{ file: File | null }>({ file: null });
    const [clientError, setClientError] = useState<string | null>(null);

    // Author hanya boleh mengunggah saat ronde masih meminta revisi.
    const isRoundOpen = currentRound.status === 'Awaiting_Revision';

    // Validasi ringan di sisi klien (tipe & ukuran) sebelum dikirim.
    const handleFile = (file: File | null) => {
        setClientError(null);

        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!ALLOWED_EXT.includes(ext)) {
                setClientError('Format berkas harus PDF atau DOCX.');
                setData('file', null);
                return;
            }
            if (file.size > MAX_FILE_MB * 1024 * 1024) {
                setClientError(`Ukuran berkas maksimal ${MAX_FILE_MB}MB.`);
                setData('file', null);
                return;
            }
        }

        setData('file', file);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            setClientError('Silakan pilih berkas revisi terlebih dahulu.');
            return;
        }

        // POST ke endpoint uploadRevision() (milik M. Aulia Luthfi) — lihat spec §5.
        // forceFormData: true wajib karena payload berisi file.
        post(`/revision/upload/${currentRound.id}`, {
            forceFormData: true,
            onSuccess: () => reset('file'),
            // Toast sukses "Berkas revisi berhasil diajukan..." otomatis dipicu
            // <FlashToast /> global dari flash message controller (Global Guide §4C).
        });
    };

    const dueDate = currentRound.due_date
        ? new Date(currentRound.due_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbaikan Naskah (Revisi)" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                {/* 1. Header Halaman */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Perbaikan Naskah (Revisi)</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ronde Ke-{currentRound.round_number}
                            {submission.title ? ` · ${submission.title}` : ''}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[currentRound.status]}`}
                        >
                            {STATUS_LABEL[currentRound.status]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CalendarClock className="h-4 w-4" />
                            Tenggat: {dueDate}
                        </span>
                    </div>
                </div>

                {/* 2. Catatan Ulasan Redaksi (komponen Tugas 4) */}
                <RevisionNotePanel note={currentRound.editor_decision_note} />

                {/* 3. Unggah berkas revisi (kiri) & riwayat versi (kanan) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Sisi Kiri: dropzone unggahan versi revisi baru */}
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <UploadCloud className="h-5 w-5 text-primary" />
                                Unggah Berkas Revisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isRoundOpen ? (
                                <form onSubmit={submit} className="space-y-4">
                                    <label
                                        htmlFor="revision-file"
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
                                    >
                                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                        {data.file ? (
                                            <span className="text-sm font-medium text-foreground">{data.file.name}</span>
                                        ) : (
                                            <>
                                                <span className="text-sm font-medium text-foreground">Klik untuk memilih berkas</span>
                                                <span className="text-xs text-muted-foreground">Format PDF atau DOCX · Maks {MAX_FILE_MB}MB</span>
                                            </>
                                        )}
                                        <input
                                            id="revision-file"
                                            type="file"
                                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            className="hidden"
                                            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                                        />
                                    </label>

                                    {/* Error klien (tipe/ukuran) atau error validasi server dari Inertia */}
                                    <InputError message={clientError ?? errors.file} />

                                    <Button type="submit" disabled={processing || !data.file} className="w-full">
                                        <Send className="mr-2 h-4 w-4" />
                                        {processing ? 'Mengunggah…' : 'Ajukan Revisi ke Editor'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                    <Info className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{CLOSED_MESSAGE[currentRound.status]}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sisi Kanan: riwayat versi naskah (komponen milik M. Aulia Luthfi) */}
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <History className="h-5 w-5 text-primary" />
                                Riwayat Versi Naskah
                            </CardTitle>
                        </CardHeader>
                        {/* <CardContent>
                            <DocumentVersionList files={fileHistory} />
                        </CardContent> */}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
