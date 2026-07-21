import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type ReceiptFormData = {
    proof_document: File | null;
    reference_number: string;
    paid_at: string;
} & Record<string, any>;

interface Props {
    /** ID of the funding (termin) this receipt belongs to */
    fundingId: number;
    /** Funding number shown in the modal description, e.g. "TRM-2026-001" */
    fundingNumber: string;
    referenceNumber?: string | null;
    paidAt?: string | null;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';

export default function ReceiptModal({ fundingId, fundingNumber, referenceNumber, paidAt, trigger, open, onOpenChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ReceiptFormData>({
        proof_document: null,
        reference_number: referenceNumber ?? '',
        paid_at: paidAt ?? '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFileName(file?.name ?? null);
        setData('proof_document', file);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset();
            clearErrors();
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
        onOpenChange?.(nextOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('funding.upload-bukti', fundingId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Bukti transfer berhasil diunggah.');
                handleOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal mengunggah bukti transfer. Periksa kembali form.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Unggah Bukti Transfer</DialogTitle>
                    <DialogDescription>Unggah bukti transfer dana untuk termin &quot;{fundingNumber}&quot;.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="proof_document">File Bukti Transfer</Label>
                        <Input id="proof_document" ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} onChange={handleFileChange} />
                        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                        <p className="text-xs text-muted-foreground">PDF, JPG, atau PNG. Maks 5 MB.</p>
                        {errors.proof_document && <span className="text-sm text-red-500">{errors.proof_document}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reference_number">No. Referensi</Label>
                        <Input
                            id="reference_number"
                            value={data.reference_number}
                            onChange={(e) => setData('reference_number', e.target.value)}
                            placeholder="Opsional"
                        />
                        {errors.reference_number && <span className="text-sm text-red-500">{errors.reference_number}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="paid_at">Tanggal Cair</Label>
                        <Input id="paid_at" type="date" value={data.paid_at} onChange={(e) => setData('paid_at', e.target.value)} />
                        {errors.paid_at && <span className="text-sm text-red-500">{errors.paid_at}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.proof_document}>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {processing ? 'Mengunggah...' : 'Unggah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
