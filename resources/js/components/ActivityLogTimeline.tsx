import { Clock, User } from 'lucide-react';

/**
 * ActivityLogTimeline Component
 *
 * @description
 * Komponen timeline vertikal yang menampilkan kronologis seluruh aksi editorial
 * pada sebuah submission. Setiap item menampilkan aksi, aktor, deskripsi,
 * dan waktu kejadian secara visual.
 *
 * @features
 * - Timeline vertikal dengan dot indicator per aksi
 * - Card per aktivitas dengan gradient accent
 * - Informasi aktor (avatar + nama)
 * - Format waktu locale id-ID
 * - Empty state saat belum ada aktivitas
 */

interface User {
    id: number;
    name: string;
}

interface Log {
    id: number;
    action: string;
    description: string | null;
    created_at: string;
    user: User;
}

interface Props {
    logs: Log[];
}

export default function ActivityLogTimeline({ logs }: Props) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Belum Ada Aktivitas</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Aktivitas editorial akan muncul pada halaman ini setelah ada aksi yang dilakukan.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Main Timeline Line */}
            <div className="absolute top-2 left-[19px] h-[calc(100%-16px)] w-[2px] bg-gradient-to-b from-primary via-secondary to-transparent"></div>

            <div className="space-y-6">
                {logs.map((log, index) => (
                    <div key={log.id} className="relative flex gap-4">
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-background shadow-sm ring-2 ring-primary/20">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                        </div>

                        {/* Card */}
                        <div className="group flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            {/* Top Accent */}
                            <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary/50"></div>

                            <div className="p-5 md:p-6">
                                {/* Header */}
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-foreground">{log.action}</h2>

                                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                                            {log.description ?? 'Tidak ada deskripsi aktivitas'}
                                        </p>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                                    {/* Avatar */}
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                        {log.user?.name?.charAt(0)}
                                    </div>

                                    {/* User */}
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">{log.user?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
