import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export default function AssignModal({
    open,
    onClose,
    onConfirm,
    loading = false,
}: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Konfirmasi Penunjukan Reviewer
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Apakah Anda yakin ingin menunjuk reviewer untuk proposal ini?
                </p>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Memproses..." : "Ya, Tunjuk"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}