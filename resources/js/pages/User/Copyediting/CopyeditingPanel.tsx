 *
 * @route GET /user/copyediting/{submission}/panel
 */
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Download, FileText, MessageSquare, Upload, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';

interface Submission {
    id: number;
    status: 'pending' | 'copyediting' | 'waiting_approval' | 'approved' | 'rejected';
    original_file_name: string | null;
    original_file_url: string | null;
    copyedited_file_name: string | null;
    copyedited_file_url: string | null;
    copyeditor_notes: string | null;
    author_approval_notes: string | null;
    copyedited_at: string | null;
    author_approved_at: string | null;
    article: { id: number; title: string } | null;
    author: { id: number; name: string } | null;
    copyeditor: { id: number; name: string } | null;
}

interface Props {
    submission: Submission;
}

const statusConfig = {
    pending:          { label: 'Menunggu', color: 'bg-gray-100 text-gray-700', icon: Clock },
    copyediting:      { label: 'Sedang Diedit', color: 'bg-blue-100 text-blue-700', icon: FileText },
    waiting_approval: { label: 'Menunggu Persetujuan Author', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved:         { label: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected:         { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function CopyeditingPanel({ submission }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        copyedited_file:  null as File | null,
        copyeditor_notes: submission.copyeditor_notes ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Copyediting', href: '#' },
        { title: 'Panel Copyeditor', href: '#' },
    ];

    const status = statusConfig[submission.status];
    const StatusIcon = status.icon;

    const canUpload = ['pending', 'copyediting'].includes(submission.status);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('copyedited_file', file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file) setData('copyedited_file', file);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('user.copyediting.upload', submission.id), {
            forceFormData: true,
            onSuccess: () => reset('copyedited_file'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel Copyeditor" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel Copyeditor</h1>
                            {submission.article && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                                    {submission.article.title}
                                </p>
                            )}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                        </span>
                    </div>

                    {/* Flash messages */}
                    {/* Note: flash messages handled by AppLayout */}

                    {/* Tiga Kolom Utama */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                        {/* ===== KOLOM 1: File Original ===== */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">File Original</h2>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Naskah asli dari Author</p>
                            </div>
                            <div className="p-5">
                                {submission.original_file_url ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                            <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                                            <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                                {submission.original_file_name}
                                            </span>
                                        </div>
                                        <a
                                            href={submission.original_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        >
                                            <Download className="h-4 w-4" />
                                            Unduh File Original
                                        </a>
                                        {submission.author && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Author: <span className="font-medium">{submission.author.name}</span>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Belum ada file original</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== KOLOM 2: File Copyedited ===== */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                        <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">File Copyedited</h2>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hasil edit Copyeditor</p>
                            </div>
                            <div className="p-5">
                                {/* File yang sudah diupload */}
                                {submission.copyedited_file_url && (
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                            <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                                            <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                                {submission.copyedited_file_name}
                                            </span>
                                        </div>
                                        <a
                                            href={submission.copyedited_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        >
                                            <Download className="h-4 w-4" />
                                            Unduh File Copyedited
                                        </a>
                                        {submission.copyedited_at && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Diupload: {new Date(submission.copyedited_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Form Upload (hanya jika bisa upload) */}
                                {canUpload && (
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        {/* Drop zone */}
                                        <div
                                            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
                                                dragOver
                                                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-gray-300 hover:border-green-400 dark:border-gray-600'
                                            }`}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mx-auto h-6 w-6 text-gray-400" />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {data.copyedited_file
                                                    ? <span className="font-medium text-green-600">{data.copyedited_file.name}</span>
                                                    : <><span className="font-medium text-green-600">Pilih file</span> atau drag & drop</>
                                                }
                                            </p>
                                            <p className="text-xs text-gray-400">PDF, DOC, DOCX • Maks 10MB</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        {errors.copyedited_file && (
                                            <p className="text-xs text-red-500">{errors.copyedited_file}</p>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.copyedited_file}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {processing ? 'Mengupload...' : 'Upload & Kirim ke Author'}
                                        </Button>
                                    </form>
                                )}

                                {/* Status approved */}
                                {submission.status === 'approved' && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                            Disetujui Author pada {submission.author_approved_at
                                                ? new Date(submission.author_approved_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== KOLOM 3: Catatan ===== */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                        <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Catatan</h2>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Komunikasi & feedback</p>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Catatan Copyeditor */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Catatan Copyeditor
                                    </label>
                                    {canUpload ? (
                                        <textarea
                                            value={data.copyeditor_notes}
                                            onChange={(e) => setData('copyeditor_notes', e.target.value)}
                                            rows={5}
                                            placeholder="Tuliskan catatan untuk Author mengenai perubahan yang dilakukan..."
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                                        />
                                    ) : (
                                        <div className="min-h-[80px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                            {submission.copyeditor_notes || <span className="text-gray-400 italic">Tidak ada catatan</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Catatan Author (balasan persetujuan/penolakan) */}
                                {submission.author_approval_notes && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Catatan Author
                                        </label>
                                        <div className={`rounded-lg border p-3 text-sm ${
                                            submission.status === 'approved'
                                                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                {submission.status === 'approved'
                                                    ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                    : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                }
                                                <p>{submission.author_approval_notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tombol ke halaman persetujuan Author (jika waiting_approval) */}
                                {submission.status === 'waiting_approval' && (
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                Menunggu persetujuan Author
                                            </p>
                                        </div>
                                        <a
                                            href={route('user.copyediting.approval', submission.id)}
                                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-700"
                                        >
                                            Lihat Halaman Persetujuan
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
