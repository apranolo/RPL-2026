import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface ReviewerOption {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (reviewerId?: number) => void;
    loading?: boolean;
    proposalTitle?: string;
    reviewers?: ReviewerOption[];
}

export default function AssignModal({ open, onClose, onConfirm, loading = false, proposalTitle, reviewers }: Props) {
    const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');

    const handleConfirm = () => {
        onConfirm(selectedReviewerId ? parseInt(selectedReviewerId, 10) : undefined);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Penunjukan Reviewer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menunjuk reviewer untuk proposal{proposalTitle ? <span className="font-semibold text-foreground"> "{proposalTitle}"</span> : ''}?
                    </p>

                    {reviewers && reviewers.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Pilih Reviewer</label>
                            <Select value={selectedReviewerId} onValueChange={setSelectedReviewerId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Pilih Reviewer --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reviewers.map((r) => (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>

                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || (!!reviewers && reviewers.length > 0 && !selectedReviewerId)}
                    >
                        {loading ? 'Memproses...' : 'Ya, Tunjuk Reviewer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
