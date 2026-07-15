import ActivityLogTimeline from '@/components/ActivityLogTimeline';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';

/**
 * ActivityLog Page (Editorial)
 *
 * @description
 * Halaman utama Activity Log untuk Editor. Menampilkan timeline kronologis
 * seluruh aksi editorial yang terjadi pada sebuah submission, termasuk
 * aktor, waktu, dan deskripsi aktivitas.
 *
 * @route GET /editorial/submissions/{submission}/activity-logs
 *
 * @features
 * - Timeline vertikal kronologis semua aksi editorial
 * - Informasi aktor (user) per aksi
 * - Detail submission ID
 * - Status empty state saat belum ada aktivitas
 *
 * @author REGIANA HERMAWAN
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
    submissionId: number;
    logs: Log[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Editorial', href: '#' },
    { title: 'Activity Log', href: '#' },
];

export default function ActivityLog({ submissionId, logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />

            {/* Wrapper utama halaman dengan padding yang responsif */}
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                {/* 1. Header Halaman */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Activity Log</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Monitor every editorial activity and workflow history for this submission.
                            </p>
                        </div>
                    </div>

                    {/* Submission ID Badge */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Submission</span>
                        <span className="text-sm font-bold text-foreground">#{submissionId}</span>
                    </div>
                </div>

                {/* 2. Area Konten — Timeline */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <ActivityLogTimeline logs={logs} />
                </div>
            </div>
        </AppLayout>
    );
}
