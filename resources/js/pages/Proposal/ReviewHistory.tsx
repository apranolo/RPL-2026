import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpenCheck, FileText, History } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Riwayat Review',
        href: '#', // Ganti dengan route yang sesuai jika ada
    },
];

// Menyesuaikan dengan data yang dikirim dari ReviewHistoryController
interface Review {
    id: number;
    score: number;
    feedback: string;
    recommendation: string | null;
    reviewed_at: string;
    registration?: {
        user?: {
            name: string;
        };
        pembinaan?: {
            // Sesuaikan dengan kolom di tabel pembinaan kamu
            title?: string;
            name?: string; 
        };
    };
}

// Interface bawaan pagination Laravel
interface PaginatedData<T> {
    data: T[];
    links: any[];
    from: number;
    to: number;
    total: number;
}

interface ReviewHistoryProps extends PageProps {
    histories: PaginatedData<Review>;
}

export default function ReviewHistory({ histories }: ReviewHistoryProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Review" />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                
                <div className="mb-2">
                    <h2 className="text-2xl font-bold tracking-tight">Riwayat Review</h2>
                    <p className="text-sm text-muted-foreground">
                        Daftar riwayat proposal/jurnal yang telah Anda evaluasi.
                    </p>
                </div>

                {/* Tabel Data History */}
                {histories.data.length > 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="min-w-full overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">#</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Pengusul</th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Skor</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Feedback</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rekomendasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                    {histories.data.map((review, index) => (
                                        <tr key={review.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {(histories.from || 1) + index}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                {new Date(review.reviewed_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-foreground">
                                                    {review.registration?.user?.name || 'Tidak diketahui'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    review.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    review.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {review.score}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={review.feedback}>
                                                {review.feedback}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={review.recommendation || ''}>
                                                {review.recommendation || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                ) : (
                    <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <div className="relative z-10">
                                <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Belum Ada Riwayat</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    Anda belum melakukan review pada proposal atau jurnal apa pun. Daftar riwayat akan muncul di sini setelah Anda menyelesaikan tugas review.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}