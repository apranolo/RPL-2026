 *
 * @route GET /user/copyediting/{submission}/approval
 */
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
    const rejectForm  = useForm({ author_approval_notes: '' });

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
                    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <h1 className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                                    Konfirmasi Persetujuan Copyediting
                                </h1>
                                <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                                    Tinjau hasil copyediting dengan seksama. Setelah disetujui, artikel akan masuk ke tahap <strong>Production</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Artikel */}
                    {submission.article && (
                        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Artikel</h2>
                            <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{submission.article.title}</p>
                            {submission.copyeditor && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Copyeditor: <span className="font-medium">{submission.copyeditor.name}</span>
                                </p>
                            )}
                            {submission.copyedited_at && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Diselesaikan: {new Date(submission.copyedited_at).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Perbandingan File */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        {/* File Original */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                File Original
                            </h3>
                            {submission.original_file_url ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
                                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                                        <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                                            {submission.original_file_name}
                                        </span>
                                    </div>
                                    <a
                                        href={submission.original_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                                    >
                                        <Download className="h-3 w-3" />
                                        Unduh Original
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Tidak tersedia</p>
                            )}
                        </div>

                        {/* File Copyedited */}
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-900/20">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                                File Copyedited ✓
                            </h3>
                            {submission.copyedited_file_url ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white p-2 dark:border-green-800 dark:bg-gray-900">
                                        <FileText className="h-4 w-4 shrink-0 text-green-600" />
                                        <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                                            {submission.copyedited_file_name}
                                        </span>
                                    </div>
                                    <a
                                        href={submission.copyedited_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                                    >
                                        <Download className="h-3 w-3" />
                                        Unduh & Tinjau
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">File belum tersedia</p>
                            )}
                        </div>
                    </div>

                    {/* Catatan Copyeditor */}
                    {submission.copyeditor_notes && (
                        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                                Catatan dari Copyeditor
                            </h3>
                            <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                                {submission.copyeditor_notes}
                            </p>
                        </div>
                    )}

                    {/* Tombol Aksi */}
                    {submission.status === 'waiting_approval' && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Keputusan Anda</h2>

                            {/* Pilih aksi */}
                            {!action && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setAction('approve')}
                                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center transition hover:border-green-400 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20"
                                    >
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                        <span className="font-semibold text-green-800 dark:text-green-300">Setujui</span>
                                        <span className="text-xs text-green-600 dark:text-green-400">Artikel lanjut ke Production</span>
                                    </button>
                                    <button
                                        onClick={() => setAction('reject')}
                                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center transition hover:border-red-400 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20"
                                    >
                                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                        <span className="font-semibold text-red-800 dark:text-red-300">Tolak</span>
                                        <span className="text-xs text-red-600 dark:text-red-400">Kembalikan ke Copyeditor</span>
                                    </button>
                                </div>
                            )}

                            {/* Form Setujui */}
                            {action === 'approve' && (
                                <form onSubmit={handleApprove} className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                            Anda akan menyetujui hasil copyediting ini
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Catatan (opsional)
                                        </label>
                                        <textarea
                                            value={approveForm.data.author_approval_notes}
                                            onChange={(e) => approveForm.setData('author_approval_notes', e.target.value)}
                                            rows={3}
                                            placeholder="Tambahkan catatan untuk Copyeditor jika ada..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setAction(null)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={approveForm.processing}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {approveForm.processing ? 'Memproses...' : 'Konfirmasi Setuju'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Form Tolak */}
                            {action === 'reject' && (
                                <form onSubmit={handleReject} className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                            File akan dikembalikan ke Copyeditor untuk direvisi
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Alasan Penolakan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={rejectForm.data.author_approval_notes}
                                            onChange={(e) => rejectForm.setData('author_approval_notes', e.target.value)}
                                            rows={4}
                                            placeholder="Jelaskan apa yang perlu diperbaiki oleh Copyeditor..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                                            required
                                        />
                                        {rejectForm.errors.author_approval_notes && (
                                            <p className="mt-1 text-xs text-red-500">{rejectForm.errors.author_approval_notes}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setAction(null)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={rejectForm.processing}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                        >
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
