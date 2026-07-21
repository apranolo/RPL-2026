/**
 * VerifyModal Component
 *
 * @description
 * A reusable modal dialog for verifying (approving/rejecting) research outputs.
 * Displays output details, provides approve button and reject form with reason textarea.
 *
 * @usage
 * <VerifyModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   output={selectedOutput}
 *   verifyUrl="/admin/output-verify"
 * />
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ResearchOutput {
    id: number;
    judul: string;
    kategori: string;
    status: string;
    file_path: string | null;
    keterangan: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    proposal?: {
        id: number;
        judul: string;
    } | null;
}

interface VerifyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    output: ResearchOutput | null;
    verifyUrl: string;
}

export default function VerifyModal({ open, onOpenChange, output, verifyUrl }: VerifyModalProps) {
    const [mode, setMode] = useState<'view' | 'reject'>('view');

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        action: '' as 'approved' | 'rejected',
        keterangan: '',
    });

    const handleApprove = () => {
        if (!output) return;
        transform((data) => ({ ...data, action: 'approved', keterangan: '' }));
        post(`${verifyUrl}/${output.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setMode('view');
                onOpenChange(false);
            },
        });
    };

    const handleReject = () => {
        if (!output) return;
        transform((data) => ({ ...data, action: 'rejected' }));
        post(`${verifyUrl}/${output.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setMode('view');
                onOpenChange(false);
            },
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            setMode('view');
        }
        onOpenChange(newOpen);
    };

    const getKategoriBadgeClass = (kategori: string) => {
        const map: Record<string, string> = {
            jurnal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            buku: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            hki: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            prosiding: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            produk: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return map[kategori] || 'bg-gray-100 text-gray-800';
    };

    if (!output) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'view' ? 'Verifikasi Luaran' : 'Tolak Luaran'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'view'
                            ? 'Periksa detail luaran dan pilih tindakan verifikasi.'
                            : 'Berikan alasan penolakan luaran penelitian ini.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Output Details */}
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Judul Luaran</p>
                            <p className="mt-1 text-sm font-semibold">{output.judul}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategori</p>
                                <Badge variant="outline" className={`mt-1 ${getKategoriBadgeClass(output.kategori)}`}>
                                    {output.kategori.toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pengusul</p>
                                <p className="mt-1 text-sm">{output.user.name}</p>
                            </div>
                        </div>
                        {output.proposal && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proposal</p>
                                <p className="mt-1 text-sm">{output.proposal.judul}</p>
                            </div>
                        )}
                        {output.file_path && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File</p>
                                <a
                                    href={`/storage/${output.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Lihat Dokumen →
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Reject Form */}
                    {mode === 'reject' && (
                        <div className="space-y-2">
                            <label htmlFor="keterangan-reject" className="text-sm font-medium">
                                Catatan Penolakan <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                id="keterangan-reject"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Tuliskan alasan penolakan luaran ini..."
                                rows={4}
                                className={errors.keterangan ? 'border-destructive' : ''}
                            />
                            {errors.keterangan && (
                                <p className="text-xs text-destructive">{errors.keterangan}</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {mode === 'view' ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setMode('reject')}
                                disabled={processing}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Tolak
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={processing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Setujui
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setMode('view');
                                    setData('keterangan', '');
                                }}
                                disabled={processing}
                            >
                                Kembali
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={processing || !data.keterangan.trim()}
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Konfirmasi Tolak
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
