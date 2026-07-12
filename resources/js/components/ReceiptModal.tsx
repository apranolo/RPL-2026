import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ReceiptFormData {
    receipt_file: File | null;
    receipt_number: string;
    disbursement_date: string;
    [key: string]: File | string | null;
}

interface Props {
    /** ID of the funding term this receipt belongs to */
    fundingTermId: number;
    /** Term name shown in the modal description, e.g. "Tahap 1" */
    termName: string;
    receiptNumber?: string | null;
    disbursementDate?: string | null;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';

export default function ReceiptModal({ fundingTermId, termName, receiptNumber, disbursementDate, trigger, open, onOpenChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ReceiptFormData>({
        receipt_file: null,
        receipt_number: receiptNumber ?? '',
        disbursement_date: disbursementDate ?? '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFileName(file?.name ?? null);
        setData('receipt_file', file);
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

        post(route('funding.upload-bukti', fundingTermId), {
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
                    <DialogDescription>Unggah bukti transfer dana untuk termin &quot;{termName}&quot;.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="receipt_file">File Bukti Transfer</Label>
                        <Input id="receipt_file" ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} onChange={handleFileChange} />
                        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                        <p className="text-xs text-muted-foreground">PDF, JPG, atau PNG. Maks 5 MB.</p>
                        {errors.receipt_file && <span className="text-sm text-red-500">{errors.receipt_file}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="receipt_number">No. Kuitansi</Label>
                        <Input
                            id="receipt_number"
                            value={data.receipt_number}
                            onChange={(e) => setData('receipt_number', e.target.value)}
                            placeholder="Opsional"
                        />
                        {errors.receipt_number && <span className="text-sm text-red-500">{errors.receipt_number}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="disbursement_date">Tanggal Cair</Label>
                        <Input
                            id="disbursement_date"
                            type="date"
                            value={data.disbursement_date}
                            onChange={(e) => setData('disbursement_date', e.target.value)}
                        />
                        {errors.disbursement_date && <span className="text-sm text-red-500">{errors.disbursement_date}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.receipt_file}>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {processing ? 'Mengunggah...' : 'Unggah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
