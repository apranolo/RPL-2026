import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Download, FileText, FolderOpen, History } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipe data — selaras dengan model SubmissionFile & RevisionRound resmi
// dari branch development (Modul 5 Kelas G / Modul 2 Kelas B)
// ---------------------------------------------------------------------------

export interface SubmissionFileItem {
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

export interface RevisionRoundItem {
    /** Primary key dari tabel revision_rounds */
    id_round: number;
    id_submission: number;
    round_number: number;
    editor_decision_note?: string;
    due_date?: string;
    status: 'Awaiting_Revision' | 'Submitted' | 'Approved' | 'Rejected';
    created_at: string;
    /** File-file yang diunggah Author pada ronde ini */
    submission_files?: SubmissionFileItem[];
}

interface DocumentVersionListProps {
    /** Daftar ronde revisi beserta file yang dikirim Author. */
    revisionRounds: RevisionRoundItem[];
    className?: string;
}

// ---------------------------------------------------------------------------
// Konstanta
// ---------------------------------------------------------------------------

const STATUS_STYLE: Record<string, string> = {
    Awaiting_Revision: 'bg-amber-50 text-amber-800 border-amber-200',
    Submitted: 'bg-blue-50 text-blue-800 border-blue-200',
    Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
};

const STATUS_LABEL: Record<string, string> = {
    Awaiting_Revision: 'Menunggu Revisi',
    Submitted: 'Revisi Dikirim',
    Approved: 'Disetujui',
    Rejected: 'Ditolak',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ---------------------------------------------------------------------------
// Sub-komponen: baris satu berkas
// ---------------------------------------------------------------------------

function FileRow({ file }: { file: SubmissionFileItem }) {
    const downloadUrl = `/storage/${file.file_path}`;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5 transition-colors hover:bg-muted/50">
            <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight font-medium" title={file.file_name}>
                    {file.file_name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {humanSize(file.file_size)} &bull; {file.file_type} &bull; {formatDate(file.created_at)}
                </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" asChild>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download={file.file_name} aria-label={`Unduh ${file.file_name}`}>
                    <Download className="h-4 w-4" />
                </a>
            </Button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-komponen: kartu satu ronde revisi
// ---------------------------------------------------------------------------

function RoundCard({ round }: { round: RevisionRoundItem }) {
    const statusStyle = STATUS_STYLE[round.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';
    const statusLabel = STATUS_LABEL[round.status] ?? round.status;
    const files = round.submission_files ?? [];

    return (
        <div className="flex gap-4">
            {/* Lingkaran nomor ronde */}
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold',
                        round.status === 'Approved'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : round.status === 'Rejected'
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : round.status === 'Submitted'
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-amber-400 bg-amber-50 text-amber-700',
                    )}
                    aria-label={`Ronde ${round.round_number}`}
                >
                    {round.round_number}
                </div>
                <div className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
            </div>

            {/* Konten ronde */}
            <div className="mb-6 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Ronde {round.round_number}</span>
                    <Badge variant="outline" className={cn('text-xs', statusStyle)}>
                        {statusLabel}
                    </Badge>
                    {round.due_date && <span className="text-xs text-muted-foreground">Tenggat: {formatDate(round.due_date)}</span>}
                </div>

                {round.editor_decision_note && (
                    <p className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Catatan Editor: </span>
                        {round.editor_decision_note}
                    </p>
                )}

                {files.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {files.map((file) => (
                            <FileRow key={file.id} file={file} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        <FolderOpen className="h-4 w-4" aria-hidden="true" />
                        <span>Belum ada berkas yang dikirim pada ronde ini.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Komponen utama: DocumentVersionList
// ---------------------------------------------------------------------------

/**
 * DocumentVersionList
 *
 * Menampilkan histori versi berkas naskah yang dikirim Author pada
 * setiap ronde revisi, dalam format timeline vertikal berlabel per ronde.
 *
 * Tipe data selaras dengan model resmi RevisionRound (primary key: id_round)
 * dan SubmissionFile (foreign key: submission_id) dari branch development.
 */
export default function DocumentVersionList({ revisionRounds, className }: DocumentVersionListProps) {
    if (revisionRounds.length === 0) {
        return (
            <div className={cn('flex flex-col items-center gap-2 py-8 text-center text-muted-foreground', className)}>
                <History className="h-10 w-10 opacity-30" aria-hidden="true" />
                <p className="text-sm">Belum ada riwayat versi berkas.</p>
            </div>
        );
    }

    return (
        <div className={cn('w-full space-y-0', className)}>
            <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Riwayat Versi Naskah</span>
                <Badge variant="secondary" className="text-xs">
                    {revisionRounds.length} Ronde
                </Badge>
            </div>

            <Separator className="mb-4" />

            <div>
                {revisionRounds.map((round) => (
                    <RoundCard key={round.id_round} round={round} />
                ))}
            </div>
        </div>
    );
}
