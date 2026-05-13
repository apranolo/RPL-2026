import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Bell, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationCardProps {
    notification: {
        id: string;
        type: string;
        data: {
            message?: string;
            title?: string;
            action_url?: string;
            [key: string]: unknown;
        };
        read_at?: string | null;
        created_at: string;
    };
    onMarkRead: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
    const isRead = !!notification.read_at;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: idLocale,
    });

    const handleMarkAsRead = () => {
        router.post(
            route('user.profil.notifications.read', notification.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Notifikasi ditandai sudah dibaca');
                    onMarkRead(notification.id);
                },
                onError: () => {
                    toast.error('Gagal menandai notifikasi');
                },
            },
        );
    };

    const getNotificationIcon = () => {
        if (notification.type.includes('Approved')) {
            return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
        } else if (notification.type.includes('Rejected') || notification.type.includes('Revision')) {
            return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
        }
        return <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    };

    const handleActionClick = () => {
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
    };

    return (
        <div
            className={`flex gap-3 rounded-lg border p-4 transition-colors ${
                isRead
                    ? 'border-sidebar-border/70 bg-card dark:border-sidebar-border'
                    : 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10'
            }`}
        >
            <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    isRead ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/20'
                }`}
            >
                {getNotificationIcon()}
            </div>
            <div className="flex-1 space-y-2">
                {notification.data.title && <h4 className="font-semibold">{notification.data.title}</h4>}
                {notification.data.message && <p className="text-sm text-muted-foreground">{notification.data.message}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{timeAgo}</span>
                    {isRead && <span className="text-green-600 dark:text-green-400">• Sudah dibaca</span>}
                </div>
                <div className="flex gap-2">
                    {notification.data.action_url && (
                        <Button variant="outline" size="sm" onClick={handleActionClick}>
                            Lihat Detail
                        </Button>
                    )}
                    {!isRead && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAsRead}>
                            Tandai Sudah Dibaca
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
