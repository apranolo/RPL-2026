/**
 * ActionButtons — Detail / Approve (Setujui) / Reject (Tolak) proposal
 *
 * @description
 * Komponen tombol aksi untuk verifikasi administrasi dan peninjauan proposal penelitian.
 * Menampilkan tombol "Lihat Detail" untuk membuka rincian proposal, serta tombol
 * "Setujui" dan "Tolak" ketika status proposal adalah "Submitted".
 *
 * @props
 * - proposalId   : ID proposal
 * - proposalTitle: Judul proposal (untuk konfirmasi)
 * - status       : Status proposal saat ini
 * - onReject     : Callback yang dipanggil saat tombol Tolak diklik
 *
 * @usage
 * ```tsx
 * <ActionButtons
 *   proposalId={proposal.id}
 *   proposalTitle={proposal.title}
 *   status={proposal.status_proposal}
 *   onReject={() => setRejectTarget(proposal)}
 * />
 * ```
 */

import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ActionButtonsProps {
    /** ID unik proposal */
    proposalId: number;
    /** Judul proposal (dipakai di dialog konfirmasi) */
    proposalTitle: string;
    /** Status proposal saat ini */
    status: string;
    /** Callback yang dipicu saat tombol "Tolak" diklik */
    onReject: () => void;
    /** Nonaktifkan tombol saat sedang memproses (opsional) */
    disabled?: boolean;
}

// ─── Status Labels ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    Administrasi_Valid: '✓ Sudah disetujui',
    Ditolak: '✗ Sudah ditolak',
    Draft: 'Belum disubmit',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionButtons({ proposalId, proposalTitle, status, onReject, disabled = false }: ActionButtonsProps) {
    const handleApprove = () => {
        if (!confirm(`Setujui proposal "${proposalTitle}"?`)) return;
        router.post(route('admin.proposals.approve', { proposal: proposalId }));
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Tombol Lihat Detail Proposal */}
            <Link href={route('proposal.show', { proposal: proposalId })}>
                <Button
                    id={`btn-detail-${proposalId}`}
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    title="Lihat Detail Proposal"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Detail
                </Button>
            </Link>

            {/* Jika status Submitted, tampilkan tombol Setujui (Approve) & Tolak (Reject) */}
            {status === 'Submitted' ? (
                <>
                    {/* Tombol Setujui (Approve) */}
                    <Button
                        id={`btn-approve-${proposalId}`}
                        size="sm"
                        disabled={disabled}
                        onClick={handleApprove}
                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Setujui
                    </Button>

                    {/* Tombol Tolak (Reject) — membuka modal penolakan */}
                    <Button
                        id={`btn-reject-${proposalId}`}
                        size="sm"
                        variant="destructive"
                        disabled={disabled}
                        onClick={onReject}
                        className="gap-1.5"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Tolak
                    </Button>
                </>
            ) : (
                <span className="text-xs text-muted-foreground ml-1">{STATUS_LABELS[status] ?? '—'}</span>
            )}
        </div>
    );
}
