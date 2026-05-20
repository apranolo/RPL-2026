import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { AlertCircle, Bell, CheckCircle2, CheckCheck, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    
    // Fallback to empty if not defined
    const notifications = auth.notifications || [];
    const unreadCount = auth.unread_notifications_count || 0;

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(
            route('user.profil.notifications.read', id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Notifikasi ditandai sudah dibaca');
                },
                onError: () => {
                    toast.error('Gagal menandai notifikasi');
                },
            }
        );
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(
            route('user.profil.notifications.read-all'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Semua notifikasi ditandai sudah dibaca');
                },
                onError: () => {
                    toast.error('Gagal menandai semua notifikasi');
                },
            }
        );
    };

    const handleNotificationClick = (id: string, actionUrl?: string) => {
        // Mark as read first
        router.post(
            route('user.profil.notifications.read', id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (actionUrl) {
                        router.visit(actionUrl);
                    }
                },
            }
        );
    };

    const getNotificationIcon = (type: string) => {
        if (type.includes('Approved')) {
            return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
        } else if (type.includes('Rejected') || type.includes('Revision')) {
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
        } else if (type.includes('Assigned') || type.includes('Reviewer')) {
            return <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
        }
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group h-9 w-9 cursor-pointer">
                    <Bell className="!size-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    {unreadCount > 0 && (
                        <>
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="sr-only">{unreadCount} unread notifications</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 rounded-lg p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border/50 dark:border-sidebar-border">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-sidebar-border/50 dark:divide-sidebar-border">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => {
                            const isRead = !!notif.read_at;
                            const timeAgo = formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                                locale: idLocale,
                            });

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif.id, notif.data?.action_url)}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                                        !isRead ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                            isRead ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-950/30'
                                        }`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-1">
                                            <p className={`text-sm truncate ${!isRead ? 'font-semibold' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                {notif.data?.title || 'Informasi'}
                                            </p>
                                            {!isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    className="text-xs text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100 p-0.5 rounded cursor-pointer transition-colors"
                                                    title="Tandai dibaca"
                                                >
                                                    <CheckCheck className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {notif.data?.message || ''}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground mt-1 block">
                                            {timeAgo}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-muted-foreground text-xs">
                            Tidak ada notifikasi baru
                        </div>
                    )}
                </div>

                <div className="px-4 py-2.5 border-t border-sidebar-border/50 dark:border-sidebar-border text-center bg-neutral-50 dark:bg-neutral-900/20">
                    <Link
                        href="/user/profil?tab=notifications"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium block w-full transition-colors"
                    >
                        Lihat Semua Notifikasi
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
