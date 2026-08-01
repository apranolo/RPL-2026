import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RevokeRoleModalProps {
    open?: boolean;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
    userName?: string;
    roleName?: string;
    onConfirm?: () => void;
    userRole?: any;
    processing?: boolean;
}

export default function RevokeRoleModal({
    open,
    isOpen,
    onOpenChange,
    onClose,
    userName,
    roleName,
    onConfirm,
    userRole,
    processing: externalProcessing = false,
}: RevokeRoleModalProps) {
    const isModalOpen = open ?? isOpen ?? false;
    const handleClose = () => {
        if (onOpenChange) onOpenChange(false);
        if (onClose) onClose();
    };

    const [confirmText, setConfirmText] = useState('');
    const { delete: destroy, processing: internalProcessing } = useForm();
    const isProcessing = externalProcessing || internalProcessing;

    useEffect(() => {
        if (!isModalOpen) {
            setConfirmText('');
        }
    }, [isModalOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onConfirm) {
            onConfirm();
            return;
        }

        if (userRole && confirmText === 'CONFIRM') {
            destroy(route('admin.users.revoke', userRole.id), {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    return (
        <AlertDialog open={isModalOpen} onOpenChange={(val) => !val && handleClose()}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-6 w-6" />
                            <AlertDialogTitle>Cabut Peran Pengguna</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-2 text-sm">
                            Tindakan ini akan menonaktifkan hak akses{' '}
                            <span className="font-semibold text-foreground">{userName || userRole?.user_name || 'pengguna'}</span> sebagai{' '}
                            <span className="font-semibold text-foreground">{roleName || userRole?.role_name || 'peran'}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Ketik &quot;CONFIRM&quot; untuk melanjutkan pencabutan peran
                        </Label>
                        <Input
                            id="confirm"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            placeholder="CONFIRM"
                            className="uppercase"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>
                                Batal
                            </Button>
                        </AlertDialogCancel>
                        <Button type="submit" variant="destructive" disabled={(confirmText !== 'CONFIRM' && !onConfirm) || isProcessing}>
                            {isProcessing ? 'Mencabut...' : 'Cabut Peran'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
