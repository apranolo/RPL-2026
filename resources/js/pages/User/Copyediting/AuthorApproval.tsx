import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Download, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Submission {
    id: number;
    status: string;
    original_file_name: string | null;
    original_file_url: string | null;
    copyedited_file_name: string | null;
    copyedited_file_url: string | null;
    copyeditor_notes: string | null;
    copyedited_at: string | null;
    article: { id: number; title: string } | null;
    copyeditor: { name: string } | null;
}

interface Props {
    submission: Submission;
}

export default function AuthorApproval({ submission }: Props) {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const approveForm = useForm({ author_approval_notes: '' });
    const rejectForm = useForm({ author_approval_notes: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Copyediting', href: '#' },
        { title: 'Konfirmasi Persetujuan', href: '#' },
    ];

    function handleApprove(e: React.FormEvent) {
        e.preventDefault();
        approveForm.post(route('user.copyediting.approve', submission.id));
    }

    function handleReject(e: React.FormEvent) {
        e.preventDefault();
        rejectForm.post(route('user.copyediting.reject', submission.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konfirmasi Persetujuan Copyediting" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                                <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100">Konfirmasi Persetujuan Copyediting</h1>
                                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                    Tinjau hasil copyediting dengan seksama. Setelah disetujui, artikel akan masuk ke tahap{' '}
                                    <strong>Production</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Artikel */}
                    {submission.article && (
                        <div className="mb-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Artikel</h2>
                            <p className="mt-1 text-base font-semibold text-card-foreground">{submission.article.title}</p>
                            {submission.copyeditor && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Copyeditor: <span className="font-medium">{submission.copyeditor.name}</span>
                                </p>
                            )}
                            {submission.copyedited_at && (
                                <p className="text-sm text-muted-foreground">
                                    Diselesaikan:{' '}
                                    {new Date(submission.copyedited_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Perbandingan File */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        {/* File Original */}
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">File Original</h3>
                            {submission.original_file_url ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-2">
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate text-xs text-foreground">{submission.original_file_name}</span>
                                    </div>
                                    <a
                                        href={submission.original_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
                                    >
                                        <Download className="h-3 w-3" />
                                        Unduh Original
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">Tidak tersedia</p>
                            )}
                        </div>

                        {/* File Copyedited */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
                            <h3 className="mb-3 text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                                File Copyedited ✓
                            </h3>
                            {submission.copyedited_file_url ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-card p-2 dark:border-emerald-800">
                                        <FileText className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <span className="truncate text-xs text-foreground">{submission.copyedited_file_name}</span>
                                    </div>
                                    <a
                                        href={submission.copyedited_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                                    >
                                        <Download className="h-3 w-3" />
                                        Unduh & Tinjau
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">File belum tersedia</p>
                            )}
                        </div>
                    </div>

                    {/* Catatan Copyeditor */}
                    {submission.copyeditor_notes && (
                        <div className="mb-4 rounded-xl border border-border bg-secondary p-4">
                            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Catatan dari Copyeditor</h3>
                            <p className="text-sm whitespace-pre-wrap text-secondary-foreground">{submission.copyeditor_notes}</p>
                        </div>
                    )}

                    {/* Tombol Aksi */}
                    {submission.status === 'waiting_approval' && (
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="mb-4 font-semibold text-card-foreground">Keputusan Anda</h2>

                            {!action && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setAction('approve')}
                                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20"
                                    >
                                        <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">Setujui</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Artikel lanjut ke Production</span>
                                    </button>
                                    <button
                                        onClick={() => setAction('reject')}
                                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-destructive/20 bg-destructive/5 p-4 text-center transition hover:border-destructive/40 hover:bg-destructive/10"
                                    >
                                        <XCircle className="h-8 w-8 text-destructive" />
                                        <span className="font-semibold text-destructive">Tolak</span>
                                        <span className="text-xs text-destructive/70">Kembalikan ke Copyeditor</span>
                                    </button>
                                </div>
                            )}

                            {/* Form Setujui */}
                            {action === 'approve' && (
                                <form onSubmit={handleApprove} className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                            Anda akan menyetujui hasil copyediting ini
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">Catatan (opsional)</label>
                                        <textarea
                                            value={approveForm.data.author_approval_notes}
                                            onChange={(e) => approveForm.setData('author_approval_notes', e.target.value)}
                                            rows={3}
                                            placeholder="Tambahkan catatan untuk Copyeditor jika ada..."
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1">
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={approveForm.processing} className="flex-1">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {approveForm.processing ? 'Memproses...' : 'Konfirmasi Setuju'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Form Tolak */}
                            {action === 'reject' && (
                                <form onSubmit={handleReject} className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/5 p-3">
                                        <XCircle className="h-5 w-5 text-destructive" />
                                        <p className="text-sm font-medium text-destructive">File akan dikembalikan ke Copyeditor untuk direvisi</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Alasan Penolakan <span className="text-destructive">*</span>
                                        </label>
                                        <textarea
                                            value={rejectForm.data.author_approval_notes}
                                            onChange={(e) => rejectForm.setData('author_approval_notes', e.target.value)}
                                            rows={4}
                                            placeholder="Jelaskan apa yang perlu diperbaiki oleh Copyeditor..."
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                            required
                                        />
                                        {rejectForm.errors.author_approval_notes && (
                                            <p className="mt-1 text-xs text-destructive">{rejectForm.errors.author_approval_notes}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1">
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={rejectForm.processing} variant="destructive" className="flex-1">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {rejectForm.processing ? 'Memproses...' : 'Konfirmasi Tolak'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
