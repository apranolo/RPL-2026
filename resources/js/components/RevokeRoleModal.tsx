import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
import { ShieldAlert } from 'lucide-react';
import { UserRole } from '@/pages/Admin/Users/Index';

interface RevokeRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: UserRole & { user_name?: string };
}

export default function RevokeRoleModal({ isOpen, onClose, userRole }: RevokeRoleModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const { delete: destroy, processing } = useForm();

    useEffect(() => {
        if (!isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText !== 'CONFIRM') return;

        destroy(route('admin.users.revoke', userRole.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-6 w-6" />
                            <AlertDialogTitle>Cabut Peran Pengguna</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-sm pt-2">
                            Tindakan ini akan menonaktifkan hak akses{' '}
                            <span className="font-semibold text-foreground">{userRole.user_name || 'pengguna'}</span>{' '}
                            sebagai <span className="font-semibold text-foreground">{userRole.role_name}</span>{' '}
                            {userRole.journal && (
                                <>
                                    pada{' '}
                                    <span className="font-semibold text-foreground">
                                        {userRole.journal.name}
                                    </span>
                                </>
                            )}
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Ketik &quot;CONFIRM&quot; untuk melanjutkan pencabutan peran
                        </Label>
                        <Input
                            id="confirm"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            placeholder="CONFIRM"
                            className="uppercase"
                            required
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                                Batal
                            </Button>
                        </AlertDialogCancel>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={confirmText !== 'CONFIRM' || processing}
                        >
                            {processing ? 'Mencabut...' : 'Cabut Peran'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
