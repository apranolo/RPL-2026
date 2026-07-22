/**
 * CopyeditingPanel Component
 *
 * @description Panel tiga kolom untuk proses copyediting naskah jurnal.
 * @features
 * - Kolom 1: Menampilkan file original dari Author
 * - Kolom 2: Upload dan tampilkan file hasil copyediting
 * - Kolom 3: Catatan komunikasi antara Copyeditor dan Author
 * @route GET /user/copyediting/{submission}/panel
 */
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
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
    pending: { label: 'Menunggu', color: 'bg-muted text-muted-foreground', icon: Clock },
    copyediting: { label: 'Sedang Diedit', color: 'bg-secondary text-secondary-foreground', icon: FileText },
    waiting_approval: {
        label: 'Menunggu Persetujuan Author',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock,
    },
    approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function CopyeditingPanel({ submission }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        copyedited_file: null as File | null,
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
                            <h1 className="text-2xl font-bold text-foreground">Panel Copyeditor</h1>
                            {submission.article && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{submission.article.title}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                        </span>
                    </div>

                    {/* Tiga Kolom Utama */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {/* ===== KOLOM 1: File Original ===== */}
                        <div className="rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                                        <FileText className="h-4 w-4 text-secondary-foreground" />
                                    </div>
                                    <h2 className="font-semibold text-card-foreground">File Original</h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Naskah asli dari Author</p>
                            </div>
                            <div className="p-5">
                                {submission.original_file_url ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
                                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-sm text-foreground">{submission.original_file_name}</span>
                                        </div>
                                        <a
                                            href={submission.original_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                                        >
                                            <Download className="h-4 w-4" />
                                            Unduh File Original
                                        </a>
                                        {submission.author && (
                                            <p className="text-xs text-muted-foreground">
                                                Author: <span className="font-medium">{submission.author.name}</span>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                                        <p className="mt-2 text-sm text-muted-foreground">Belum ada file original</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== KOLOM 2: File Copyedited ===== */}
                        <div className="rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                        <Upload className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                    </div>
                                    <h2 className="font-semibold text-card-foreground">File Copyedited</h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Hasil edit Copyeditor</p>
                            </div>
                            <div className="p-5">
                                {submission.copyedited_file_url && (
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                                            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <span className="truncate text-sm text-foreground">{submission.copyedited_file_name}</span>
                                        </div>
                                        <a
                                            href={submission.copyedited_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        >
                                            <Download className="h-4 w-4" />
                                            Unduh File Copyedited
                                        </a>
                                        {submission.copyedited_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Diupload:{' '}
                                                {new Date(submission.copyedited_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {canUpload && (
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div
                                            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
                                                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                                            }`}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOver(true);
                                            }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {data.copyedited_file ? (
                                                    <span className="font-medium text-primary">{data.copyedited_file.name}</span>
                                                ) : (
                                                    <>
                                                        <span className="font-medium text-primary">Pilih file</span> atau drag & drop
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX • Maks 10MB</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        {errors.copyedited_file && <p className="text-xs text-destructive">{errors.copyedited_file}</p>}
                                        <Button type="submit" disabled={processing || !data.copyedited_file} className="w-full">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {processing ? 'Mengupload...' : 'Upload & Kirim ke Author'}
                                        </Button>
                                    </form>
                                )}

                                {submission.status === 'approved' && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                            Disetujui Author pada{' '}
                                            {submission.author_approved_at
                                                ? new Date(submission.author_approved_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== KOLOM 3: Catatan ===== */}
                        <div className="rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                                        <MessageSquare className="h-4 w-4 text-secondary-foreground" />
                                    </div>
                                    <h2 className="font-semibold text-card-foreground">Catatan</h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Komunikasi & feedback</p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Catatan Copyeditor
                                    </label>
                                    {canUpload ? (
                                        <textarea
                                            value={data.copyeditor_notes}
                                            onChange={(e) => setData('copyeditor_notes', e.target.value)}
                                            rows={5}
                                            placeholder="Tuliskan catatan untuk Author mengenai perubahan yang dilakukan..."
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    ) : (
                                        <div className="min-h-[80px] rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
                                            {submission.copyeditor_notes || <span className="text-muted-foreground italic">Tidak ada catatan</span>}
                                        </div>
                                    )}
                                </div>

                                {submission.author_approval_notes && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Catatan Author
                                        </label>
                                        <div
                                            className={`rounded-lg border p-3 text-sm ${
                                                submission.status === 'approved'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                    : 'border-destructive/20 bg-destructive/5 text-destructive'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {submission.status === 'approved' ? (
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                )}
                                                <p>{submission.author_approval_notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {submission.status === 'waiting_approval' && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <p className="text-sm text-amber-800 dark:text-amber-300">Menunggu persetujuan Author</p>
                                        </div>
                                        <a
                                            href={route('user.copyediting.approval', submission.id)}
                                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
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
