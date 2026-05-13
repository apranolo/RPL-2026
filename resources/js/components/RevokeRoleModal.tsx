import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RevokeRoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    roleName: string;
    onConfirm: () => void;
    processing?: boolean;
}

export default function RevokeRoleModal({ open, onOpenChange, userName, roleName, onConfirm, processing = false }: RevokeRoleModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cabut Peran (Revoke Role)</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin mencabut peran <strong>{roleName}</strong> dari pengguna <strong>{userName}</strong>? Pengguna mungkin
                        kehilangan akses ke fitur-fitur tertentu.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Cabut Peran'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
