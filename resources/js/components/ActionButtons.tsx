/**
 * ActionButtons — Approve / Reject proposal
 *
 * @description
 * Komponen tombol aksi untuk validasi administrasi proposal penelitian.
 * Hanya ditampilkan ketika status proposal adalah "Submitted".
 * Tombol "Validasi" langsung mengirim request approve, sedangkan tombol
 * "Tolak" membuka RejectModal untuk mengisi alasan penolakan.
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
import { router } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';

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
    Administrasi_Valid: '✓ Sudah divalidasi',
    Ditolak: '✗ Sudah ditolak',
    Draft: 'Belum disubmit',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionButtons({ proposalId, proposalTitle, status, onReject, disabled = false }: ActionButtonsProps) {
    // Hanya tampilkan tombol Validasi & Tolak jika status === 'Submitted'
    if (status !== 'Submitted') {
        return <span className="text-xs text-muted-foreground">{STATUS_LABELS[status] ?? '—'}</span>;
    }

    const handleApprove = () => {
        if (!confirm(`Validasi proposal "${proposalTitle}"?`)) return;
        router.post(route('admin.proposals.approve', { proposal: proposalId }));
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Tombol Validasi (Approve) */}
            <Button
                id={`btn-approve-${proposalId}`}
                size="sm"
                disabled={disabled}
                onClick={handleApprove}
                className="gap-1.5 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
                <CheckCircle className="h-3.5 w-3.5" />
                Validasi
            </Button>

            {/* Tombol Tolak (Reject) — membuka modal */}
            <Button id={`btn-reject-${proposalId}`} size="sm" variant="destructive" disabled={disabled} onClick={onReject} className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Tolak
            </Button>
        </div>
    );
}
