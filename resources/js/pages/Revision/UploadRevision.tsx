import DocumentVersionList from '@/components/DocumentVersionList';
import InputError from '@/components/input-error';
import RevisionNotePanel from '@/components/RevisionNotePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CalendarClock, History, Send, UploadCloud } from 'lucide-react';
import { useState, type FormEvent } from 'react';

// ---------------------------------------------------------------------------
// Tipe data (selaras dengan spec Modul 2 & 5 Kelas B / Kelas G)
// ---------------------------------------------------------------------------

interface SubmissionFileItem {
    id: number;
    submission_id: number;
    revision_round_id?: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    mime_type?: string;
    created_at: string;
}

interface RevisionRoundItem {
    id_round: number;
    id_submission: number;
    round_number: number;
    editor_decision_note: string;
    due_date: string;
    status: 'Awaiting_Revision' | 'Submitted' | 'Approved' | 'Rejected';
    created_at: string;
    submission_files?: SubmissionFileItem[];
}

interface SubmissionItem {
    id: number;
    title: string | null;
    author_id: number;
    journal?: { name: string };
}

interface UploadRevisionProps extends PageProps {
    submission: SubmissionItem;
    currentRound: RevisionRoundItem;
    fileHistory: SubmissionFileItem[];
}

// ---------------------------------------------------------------------------
// Konstanta sesuai spec §3.A.3
// ---------------------------------------------------------------------------

const MAX_FILE_MB = 20;
const ALLOWED_EXT = ['pdf', 'docx'];

const STATUS_STYLE: Record<RevisionRoundItem['status'], string> = {
    Awaiting_Revision: 'bg-amber-50 text-amber-800 border-amber-200',
    Submitted:         'bg-slate-100 text-slate-800 border-slate-200',
    Approved:          'bg-emerald-50 text-emerald-800 border-emerald-200',
    Rejected:          'bg-rose-50 text-rose-800 border-rose-200',
};

const STATUS_LABEL: Record<RevisionRoundItem['status'], string> = {
    Awaiting_Revision: 'Menunggu Revisi',
    Submitted:         'Revisi Dikirim',
    Approved:          'Disetujui',
    Rejected:          'Ditolak',
};

const CLOSED_MESSAGE: Record<string, string> = {
    Submitted: 'Revisi sudah dikirim. Menunggu keputusan editor.',
    Approved:  'Revisi telah disetujui oleh editor.',
    Rejected:  'Revisi ditolak. Hubungi editor untuk informasi lebih lanjut.',
};

// ---------------------------------------------------------------------------
// Helper: konversi file history ke format RevisionRoundItem[]
// untuk DocumentVersionList
// ---------------------------------------------------------------------------
function buildVersionRounds(
    currentRound: RevisionRoundItem,
    fileHistory: SubmissionFileItem[],
): RevisionRoundItem[] {
    return [
        {
            ...currentRound,
            submission_files: fileHistory,
        },
    ];
}

// ---------------------------------------------------------------------------
// Komponen utama: UploadRevision
// ---------------------------------------------------------------------------

/**
 * UploadRevision
 *
 * Halaman untuk Author mengunggah berkas revisi naskah proposal riset
 * pada ronde revisi tertentu (Modul 2 Kelas B — Submission System).
 *
 * Berkas dikirim ke POST /revision/upload/{id_round} → RevisionController@uploadRevision
 * yang mencatat file ke tabel submission_files dengan id_submission sebagai foreign key.
 *
 * Sisi kanan menampilkan riwayat versi berkas (DocumentVersionList).
 */
export default function UploadRevision({
    submission,
    currentRound,
    fileHistory,
}: UploadRevisionProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',   href: '/dashboard' },
        { title: 'Submission',  href: '/submissions' },
        { title: submission.title ?? `Submission #${submission.id}`, href: `/submissions/${submission.id}` },
        { title: `Revisi — Ronde ${currentRound.round_number}`, href: '#' },
    ];

    // Inertia form — file tunggal sesuai spec §3.A.3
    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
        notes: string;
    }>({
        file:  null,
        notes: '',
    });

    const [clientError, setClientError] = useState<string | null>(null);

    // Author hanya boleh mengunggah saat ronde masih Awaiting_Revision
    const isRoundOpen = currentRound.status === 'Awaiting_Revision';

    // Validasi ringan sisi klien (tipe & ukuran) sebelum dikirim ke server
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
                setClientError(`Ukuran berkas maksimal ${MAX_FILE_MB} MB.`);
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

        // POST ke RevisionController@uploadRevision
        // forceFormData: true wajib karena payload berisi file
        post(`/revision/upload/${currentRound.id_round}`, {
            forceFormData: true,
            onSuccess: () => reset('file'),
        });
    };

    const dueDate = currentRound.due_date
        ? new Date(currentRound.due_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '—';

    // Siapkan data untuk komponen DocumentVersionList
    const versionRounds = buildVersionRounds(currentRound, fileHistory);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbaikan Naskah (Revisi)" />

            <div className="flex w-full max-w-7xl mx-auto flex-col gap-6 p-4 md:p-8">
                {/* ---- Header Halaman ---- */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Perbaikan Naskah (Revisi)
                        </h1>
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

                {/* ---- Catatan Ulasan Redaksi (komponen bersama dari development) ---- */}
                <RevisionNotePanel note={currentRound.editor_decision_note} />

                {/* ---- Konten Utama: Form Unggah (kiri) & Riwayat Versi (kanan) ---- */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Sisi Kiri: form unggah berkas revisi */}
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
                                    {/* Drop zone / file picker */}
                                    <label
                                        htmlFor="revision-file"
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
                                    >
                                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                        {data.file ? (
                                            <span className="text-sm font-medium text-foreground">
                                                {data.file.name}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="text-sm font-medium text-foreground">
                                                    Klik untuk memilih berkas
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Format PDF atau DOCX · Maks {MAX_FILE_MB} MB
                                                </span>
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

                                    {/* Error klien atau validasi server */}
                                    <InputError message={clientError ?? errors.file} />

                                    <Button
                                        id="btn-ajukan-revisi"
                                        type="submit"
                                        disabled={processing || !data.file}
                                        className="w-full"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {processing ? 'Mengunggah…' : 'Ajukan Revisi ke Editor'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                    <UploadCloud className="h-8 w-8 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">
                                        {CLOSED_MESSAGE[currentRound.status] ?? 'Ronde ini sudah ditutup.'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sisi Kanan: riwayat versi berkas (DocumentVersionList) */}
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <History className="h-5 w-5 text-primary" />
                                Riwayat Versi Naskah
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DocumentVersionList revisionRounds={versionRounds} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
