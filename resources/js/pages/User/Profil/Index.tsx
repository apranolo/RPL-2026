import ActivityItem from '@/components/profile/ActivityItem';
import NotificationCard from '@/components/profile/NotificationCard';
import ProfileCard from '@/components/profile/ProfileCard';
import StatCard from '@/components/profile/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, BookOpen, ClipboardCheck, Clock, Edit, Eye, History, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Profil Index Page (User/Pengelola Jurnal)
 *
 * @description User profile dashboard with comprehensive overview
 * @route GET /user/profil
 * @features Profile overview, statistics, journals, activity history, notifications
 */

interface ProfilIndexProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        position?: string;
        avatar_url?: string;
        initials?: string;
        email_verified_at?: string;
        last_login_at?: string;
        created_at?: string;
        university?: {
            id: number;
            name: string;
            short_name?: string;
        };
        scientific_field?: {
            id: number;
            name: string;
            code: string;
        };
    };
    statistics: {
        total_journals: number;
        total_assessments: number;
        average_score: number;
        journals_by_status: {
            pending: number;
            approved: number;
            rejected: number;
        };
    };
    journals: Array<{
        id: number;
        title: string;
        issn?: string;
        e_issn?: string;
        url?: string;
        approval_status: string;
        is_active: boolean;
        scientific_field?: {
            id: number;
            name: string;
            code: string;
        };
        latest_assessment?: {
            id: number;
            total_score: number;
            status: string;
            submitted_at?: string;
        } | null;
        created_at: string;
    }>;
    recentActivity: Array<{
        id: number;
        type: 'received' | 'transferred';
        journal: {
            id: number;
            title: string;
        };
        from_user?: {
            id: number;
            name: string;
        } | null;
        to_user?: {
            id: number;
            name: string;
        } | null;
        reassigned_by?: {
            id: number;
            name: string;
        } | null;
        reason?: string | null;
        created_at: string;
    }>;
    notifications: Array<{
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
    }>;
    unreadNotificationsCount: number;
}

export default function ProfilIndex({ user, statistics, journals, recentActivity, notifications, unreadNotificationsCount }: ProfilIndexProps) {
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadNotificationsCount);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Profil', href: route('user.profil.index') },
    ];

    const handleMarkNotificationAsRead = (id: string) => {
        setLocalNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif)));
        setLocalUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = () => {
        router.post(
            route('user.profil.notifications.read-all'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Semua notifikasi ditandai sudah dibaca');
                    setLocalNotifications((prev) => prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() })));
                    setLocalUnreadCount(0);
                },
                onError: () => {
                    toast.error('Gagal menandai semua notifikasi');
                },
            },
        );
    };

    const filteredNotifications = notificationFilter === 'unread' ? localNotifications.filter((n) => !n.read_at) : localNotifications;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            approved: { label: 'Approved', variant: 'default' as const },
            rejected: { label: 'Rejected', variant: 'destructive' as const },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            variant: 'secondary' as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil" />

            <div className="space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="journals">
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Jurnal Saya</span>
                            {journals.length > 0 && (
                                <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                                    {journals.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            <History className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Riwayat</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Notifikasi</span>
                            {localUnreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {localUnreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        <ProfileCard user={user} />

                        {/* Statistics Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard icon={BookOpen} label="Total Jurnal" value={statistics.total_journals} color="blue" />
                            <StatCard icon={ClipboardCheck} label="Total Penilaian" value={statistics.total_assessments} color="green" />
                            <StatCard icon={TrendingUp} label="Rata-rata Skor" value={statistics.average_score.toFixed(2)} color="purple" />
                            <StatCard icon={Clock} label="Pending" value={statistics.journals_by_status.pending} color="amber" />
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
                                {recentActivity.length > 5 && (
                                    <Button variant="ghost" size="sm" onClick={() => document.getElementById('activity-tab')?.click()}>
                                        Lihat Semua
                                    </Button>
                                )}
                            </div>
                            {recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.slice(0, 5).map((activity) => (
                                        <ActivityItem key={activity.id} activity={activity} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <History className="mx-auto h-12 w-12 opacity-50" />
                                    <p className="mt-2">Belum ada aktivitas</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 2: Jurnal Saya */}
                    <TabsContent value="journals" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Jurnal yang Dikelola</h2>
                            <Link href={route('user.journals.create')}>
                                <Button>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Tambah Jurnal
                                </Button>
                            </Link>
                        </div>

                        {journals.length > 0 ? (
                            <div className="rounded-lg border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Judul Jurnal</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">ISSN</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Bidang Ilmu</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Penilaian Terakhir</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                            {journals.map((journal) => (
                                                <tr key={journal.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <div className="font-medium">{journal.title}</div>
                                                            {!journal.is_active && (
                                                                <Badge variant="outline" className="mt-1">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{journal.issn || '-'}</td>
                                                    <td className="px-4 py-3 text-sm">{journal.scientific_field?.name || '-'}</td>
                                                    <td className="px-4 py-3">{getStatusBadge(journal.approval_status)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {journal.latest_assessment ? (
                                                            <div>
                                                                <div>Skor: {journal.latest_assessment.total_score}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {journal.latest_assessment.submitted_at}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">Belum ada</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={route('user.journals.show', journal.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('user.journals.edit', journal.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-12 text-center dark:border-sidebar-border">
                                <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                                <h3 className="mt-4 text-lg font-semibold">Belum Ada Jurnal</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Anda belum mengelola jurnal apapun. Mulai tambahkan jurnal pertama Anda.
                                </p>
                                <Link href={route('user.journals.create')}>
                                    <Button className="mt-4">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Tambah Jurnal
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 3: Riwayat Aktivitas */}
                    <TabsContent value="activity" className="space-y-4" id="activity-tab">
                        <h2 className="text-xl font-semibold">Riwayat Aktivitas</h2>

                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-12 text-center dark:border-sidebar-border">
                                <History className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                                <h3 className="mt-4 text-lg font-semibold">Belum Ada Aktivitas</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Riwayat pengalihan jurnal akan muncul di sini.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 4: Notifikasi */}
                    <TabsContent value="notifications" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Notifikasi</h2>
                            <div className="flex gap-2">
                                <Button
                                    variant={notificationFilter === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setNotificationFilter('all')}
                                >
                                    Semua ({localNotifications.length})
                                </Button>
                                <Button
                                    variant={notificationFilter === 'unread' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setNotificationFilter('unread')}
                                >
                                    Belum Dibaca ({localUnreadCount})
                                </Button>
                                {localUnreadCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                                        Tandai Semua Sudah Dibaca
                                    </Button>
                                )}
                            </div>
                        </div>

                        {filteredNotifications.length > 0 ? (
                            <div className="space-y-3">
                                {filteredNotifications.map((notification) => (
                                    <NotificationCard key={notification.id} notification={notification} onMarkRead={handleMarkNotificationAsRead} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-sidebar-border/70 bg-card p-12 text-center dark:border-sidebar-border">
                                <Bell className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    {notificationFilter === 'unread' ? 'Tidak Ada Notifikasi Belum Dibaca' : 'Belum Ada Notifikasi'}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {notificationFilter === 'unread' ? 'Semua notifikasi sudah dibaca.' : 'Notifikasi akan muncul di sini.'}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
