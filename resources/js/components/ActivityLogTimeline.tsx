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

export default function ActivityLogTimeline({
    logs,
}: Props) {
    if (logs.length === 0) {
        return (
            <div className="rounded-[32px] border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl font-bold text-white">
                    Belum Ada Aktivitas
                </h3>

                <p className="mt-3 text-sm text-emerald-100/70">
                    Aktivitas editorial akan muncul pada halaman ini.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Main Timeline Line */}
            <div className="absolute left-5 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-emerald-300 via-cyan-300 to-transparent"></div>

            <div className="space-y-10">
                {logs.map((log, index) => (
                    <div
                        key={log.id}
                        className="relative flex gap-6"
                    >
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-emerald-300 bg-slate-900 shadow-lg shadow-emerald-500/40">
                            <div className="h-3 w-3 rounded-full bg-emerald-300"></div>
                        </div>

                        {/* Card */}
                        <div className="group flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                            {/* Top Accent */}
                            <div className="h-1 w-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400"></div>

                            <div className="p-6 md:p-8">
                                {/* Header */}
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-white">
                                            {log.action}
                                        </h2>

                                        <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/80">
                                            {log.description ??
                                                'Tidak ada deskripsi aktivitas'}
                                        </p>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 shadow-lg">
                                        {new Date(
                                            log.created_at
                                        ).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5">
                                    {/* Avatar */}
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 text-lg font-bold text-slate-900 shadow-lg">
                                        {log.user?.name?.charAt(0)}
                                    </div>

                                    {/* User */}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/40">
                                            Actor
                                        </p>

                                        <p className="mt-1 text-base font-semibold text-white">
                                            {log.user?.name}
                                        </p>
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