import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Download, FileText, FolderOpen, RotateCcw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipe data
// ---------------------------------------------------------------------------

export interface SubmissionFileItem {
    id: number;
    revision_round_id: number;
    uploaded_by: number;
    original_filename: string;
    stored_filename: string;
    file_path: string;
    file_size: number;
    mime_type?: string;
    notes?: string;
    file_size_human?: string;
    download_url?: string;
    created_at: string;
    uploader?: { id: number; name: string };
}

export interface RevisionRoundItem {
    id: number;
    journal_assessment_id: number;
    round_number: number;
    requested_by: number;
    request_notes?: string;
    requested_at?: string;
    status: 'pending' | 'submitted' | 'accepted' | 'rejected';
    status_label?: string;
    status_color?: string;
    created_at: string;
    requester?: { id: number; name: string };
    submission_files: SubmissionFileItem[];
}

interface DocumentVersionListProps {
    /** Daftar semua ronde revisi dengan file yang dikirim Author. */
    revisionRounds: RevisionRoundItem[];
    /** Tampilkan tombol unggah file revisi jika ronde terakhir masih pending. */
    uploadUrl?: string;
    className?: string;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Menunggu Revisi',
    submitted: 'Revisi Dikirim',
    accepted: 'Revisi Diterima',
    rejected: 'Revisi Ditolak',
};

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
// Sub-komponen: baris satu file
// ---------------------------------------------------------------------------

function FileRow({ file }: { file: SubmissionFileItem }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5 transition-colors hover:bg-muted/60">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight" title={file.original_filename}>
                        {file.original_filename}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {file.file_size_human ?? `${file.file_size} B`} &bull; Diunggah{' '}
                        {file.uploader?.name ?? 'Author'} &bull; {formatDate(file.created_at)}
                    </p>
                    {file.notes && (
                        <p className="mt-0.5 truncate text-xs italic text-muted-foreground" title={file.notes}>
                            {file.notes}
                        </p>
                    )}
                </div>
            </div>

            {file.download_url && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                asChild
                            >
                                <a
                                    href={file.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={file.original_filename}
                                    aria-label={`Unduh ${file.original_filename}`}
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Unduh file</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-komponen: satu kartu ronde revisi
// ---------------------------------------------------------------------------

function RoundCard({ round }: { round: RevisionRoundItem }) {
    const statusColor = STATUS_COLORS[round.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';
    const statusLabel = round.status_label ?? STATUS_LABELS[round.status] ?? round.status;
    const hasFiles = round.submission_files.length > 0;

    return (
        <div className="relative flex gap-4">
            {/* Garis vertikal timeline */}
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold',
                        round.status === 'accepted'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : round.status === 'rejected'
                              ? 'border-red-400 bg-red-50 text-red-700'
                              : round.status === 'submitted'
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-amber-400 bg-amber-50 text-amber-700',
                    )}
                    aria-label={`Ronde ${round.round_number}`}
                >
                    {round.round_number}
                </div>
                {/* Garis ke bawah — disembunyikan di kartu terakhir via CSS di parent */}
                <div className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
            </div>

            {/* Konten kartu */}
            <div className="mb-6 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        Ronde {round.round_number}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn('text-xs', statusColor)}
                    >
                        {statusLabel}
                    </Badge>
                    {round.requested_at && (
                        <span className="text-xs text-muted-foreground">
                            Diminta: {formatDate(round.requested_at)}
                        </span>
                    )}
                </div>

                {round.request_notes && (
                    <p className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Catatan penilai: </span>
                        {round.request_notes}
                    </p>
                )}

                {hasFiles ? (
                    <div className="flex flex-col gap-2">
                        {round.submission_files.map((file) => (
                            <FileRow key={file.id} file={file} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        <FolderOpen className="h-4 w-4" aria-hidden="true" />
                        <span>Belum ada file yang dikirim pada ronde ini.</span>
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
 * Menampilkan daftar versi dokumen revisi yang dilabeli per ronde
 * dalam format timeline vertikal. Setiap ronde menampilkan seluruh
 * file yang dikirim Author beserta tombol unduh masing-masing file.
 */
export default function DocumentVersionList({
    revisionRounds,
    uploadUrl,
    className,
}: DocumentVersionListProps) {
    if (revisionRounds.length === 0) {
        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Histori Versi Dokumen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                        <FolderOpen className="h-10 w-10 opacity-40" aria-hidden="true" />
                        <p className="text-sm">Belum ada ronde revisi untuk assessment ini.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const lastRound = revisionRounds[revisionRounds.length - 1];
    const canUpload = uploadUrl && lastRound?.status === 'pending';

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Histori Versi Dokumen
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {revisionRounds.length} Ronde
                    </Badge>
                </CardTitle>

                {canUpload && (
                    <Button size="sm" asChild>
                        <a href={uploadUrl} id="btn-upload-revisi">
                            Upload Revisi
                        </a>
                    </Button>
                )}
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
                {/* Timeline ronde */}
                <div>
                    {revisionRounds.map((round, idx) => (
                        <div
                            key={round.id}
                            className={cn(idx === revisionRounds.length - 1 && '[&_.timeline-line]:hidden')}
                        >
                            <RoundCard round={round} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
