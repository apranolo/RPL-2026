import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * FlashToast
 *
 * Listens to Inertia-shared flash messages (success / error) and displays them
 * as Sonner toasts automatically on every page visit.
 *
 * Mount this once inside AppLayout — no per-page wiring needed.
 */
export function FlashToast() {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { duration: 4000 });
        }
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error, { duration: 6000 });
        }
    }, [flash?.error]);

    return null;
}
