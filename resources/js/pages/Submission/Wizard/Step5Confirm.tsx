/**
 * Wizard Step 5 — Confirm & Submit
 *
 * @description Summary page showing all data from Steps 1-4 for OJS Submission.
 *              The user reviews everything and clicks "Submit" to finalize.
 * @route GET /user/submission-wizard/{submission}/confirm
 */
import WizardProgressBar, { type WizardStep } from '@/components/WizardProgressBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle,
    FileText,
    Send,
    Users,
    Globe,
    Tag,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

// ─── Type Definitions ───────────────────────────────────────────────

interface Journal {
    id: number;
    title?: string;
    name?: string;
    issn?: string;
    e_issn?: string;
}

interface SubmissionFile {
    id: number;
    file_path: string;
    file_type: 'ManuscriptMain' | 'Supplementary';
    file_size: number;
}

interface Contributor {
    id: number;
    name: string;
    email: string;
    affiliation?: string;
    is_corresponding: boolean;
}

interface Submission {
    id: number;
    journal_id: number;
    author_id: number;
    title: string | null;
    abstract: string | null;
    keywords: string[] | string | null;
    language: string;
    status: string;
    journal?: Journal;
    files?: SubmissionFile[];
    contributors?: Contributor[];
}

interface Props {
    submission: Submission;
}

// ─── Format File Size Helper ────────────────────────────────────────

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function Step5Confirm({ submission }: Props) {
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Profil', href: route('user.profil.index') },
        { title: 'Kirim Naskah (Wizard)', href: '#' },
    ];

    // Progress Bar configuration
    const wizardSteps: WizardStep[] = [
        { label: 'Start', description: 'Pilih Jurnal & Syarat', complete: true },
        { label: 'Upload Files', description: 'Unggah Manuskrip', complete: true },
        { label: 'Metadata', description: 'Judul & Abstrak', complete: true },
        { label: 'Contributors', description: 'Penulis Pendamping', complete: true },
        { label: 'Confirm', description: 'Rangkuman & Submit', complete: false },
    ];

    // Data validations
    const hasTitle = !!submission.title?.trim();
    const hasAbstract = !!submission.abstract?.trim();
    const hasMainManuscript = submission.files?.some(f => f.file_type === 'ManuscriptMain') ?? false;
    const hasJournal = !!submission.journal;

    const validationErrors: string[] = [];
    if (!hasJournal) validationErrors.push('Jurnal tujuan belum dipilih.');
    if (!hasTitle) validationErrors.push('Judul naskah wajib diisi.');
    if (!hasAbstract) validationErrors.push('Abstrak naskah wajib diisi.');
    if (!hasMainManuscript) validationErrors.push('Berkas manuskrip utama wajib diunggah.');

    const isValid = validationErrors.length === 0;
    const canSubmit = isValid && confirmed && !submitting;

    const handleFinalSubmit = () => {
        if (!canSubmit) return;
        setSubmitting(true);

        router.post(
            route('user.submission-wizard.final-submit', submission.id),
            { confirm_submission: true },
            {
                preserveScroll: true,
                onError: () => setSubmitting(false),
            }
        );
    };

    // Parse Keywords safely
    let parsedKeywords: string[] = [];
    if (Array.isArray(submission.keywords)) {
        parsedKeywords = submission.keywords;
    } else if (typeof submission.keywords === 'string') {
        try {
            const parsed = JSON.parse(submission.keywords);
            parsedKeywords = Array.isArray(parsed) ? parsed : [submission.keywords];
        } catch {
            parsedKeywords = submission.keywords.split(',').map(k => k.trim()).filter(Boolean);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konfirmasi &amp; Kirim Naskah — Wizard Step 5" />

            <div className="mx-auto max-w-5xl space-y-8 pb-12">
                {/* ── Page Header ───────────────────────────── */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                        Konfirmasi &amp; Kirim Naskah
                    </h1>
                    <p className="text-muted-foreground">
                        Tinjau ringkasan naskah artikel Anda sebelum melakukan pengiriman final ke dewan editor.
                    </p>
                </div>

                {/* ── Wizard Progress Bar ───────────────────── */}
                <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/20">
                    <CardContent className="pt-6">
                        <WizardProgressBar steps={wizardSteps} currentStep={4} />
                    </CardContent>
                </Card>

                {/* ── Validation Alerts ─────────────────────── */}
                {validationErrors.length > 0 ? (
                    <Card className="border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                Kelengkapan Dokumen Belum Terpenuhi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-inside list-disc space-y-1.5 text-sm text-red-600 dark:text-red-300">
                                {validationErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Silakan kembali ke langkah-langkah sebelumnya untuk melengkapi data yang kurang.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20">
                        <CardContent className="flex items-center gap-3 py-4">
                            <CheckCircle className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                    Dokumen Lengkap &amp; Siap Kirim
                                </p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                    Semua persyaratan pengisian naskah utama dan metadata dasar telah dipenuhi.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Step 1 Summary: Target Jurnal ─────────── */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
                    <CardHeader className="bg-slate-50/40 dark:bg-slate-900/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Langkah 1 — Jurnal Target
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Nama Jurnal
                                </dt>
                                <dd className="mt-1 text-sm font-bold text-foreground">
                                    {submission.journal?.title || submission.journal?.name || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    ISSN / E-ISSN
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                    {submission.journal?.issn || '—'}
                                    {submission.journal?.e_issn && ` / ${submission.journal.e_issn}`}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Pernyataan persetujuan lisensi dan etika pengajuan telah disetujui.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Step 2 Summary: Berkas Unggahan ───────── */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
                    <CardHeader className="bg-slate-50/40 dark:bg-slate-900/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <FileText className="h-5 w-5 text-amber-500" />
                            Langkah 2 — Berkas Naskah
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {submission.files && submission.files.length > 0 ? (
                            <div className="space-y-3">
                                {submission.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/45"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="h-8 w-8 shrink-0 text-slate-400" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {file.file_path.split('/').pop()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Ukuran: {formatBytes(file.file_size)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <Badge
                                                variant={file.file_type === 'ManuscriptMain' ? 'default' : 'secondary'}
                                                className="shrink-0"
                                            >
                                                {file.file_type === 'ManuscriptMain' ? 'Manuskrip Utama' : 'File Pendukung'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800">
                                <FileText className="h-10 w-10 text-slate-300 mb-2" />
                                <span className="text-sm italic">Belum ada berkas naskah yang diunggah.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 3 Summary: Metadata Naskah ───────── */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
                    <CardHeader className="bg-slate-50/40 dark:bg-slate-900/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <Tag className="h-5 w-5 text-indigo-500" />
                            Langkah 3 — Informasi &amp; Metadata
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Judul Artikel
                                </span>
                                <h2 className="mt-1 text-base font-bold text-foreground leading-snug">
                                    {submission.title || <span className="text-red-500 italic">Judul belum diisi</span>}
                                </h2>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Bahasa Pengantar
                                </span>
                                <p className="mt-1 text-sm font-medium">
                                    {submission.language === 'en' ? 'English (en)' : 'Bahasa Indonesia (id)'}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Abstrak
                            </span>
                            <div className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-line bg-slate-50/30 border border-slate-100 rounded-md p-4 dark:border-slate-800 dark:bg-slate-900/20">
                                {submission.abstract || (
                                    <span className="text-red-500 italic">Abstrak naskah belum diisi</span>
                                )}
                            </div>
                        </div>

                        {parsedKeywords.length > 0 && (
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                                    Kata Kunci (Keywords)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedKeywords.map((kw, i) => (
                                        <Badge key={i} variant="outline" className="px-2.5 py-1 text-xs">
                                            {kw}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 4 Summary: Kontributor ───────────── */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
                    <CardHeader className="bg-slate-50/40 dark:bg-slate-900/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <Users className="h-5 w-5 text-violet-500" />
                            Langkah 4 — Penulis Pendamping (Co-Authors)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {submission.contributors && submission.contributors.length > 0 ? (
                            <div className="overflow-hidden border border-slate-100 rounded-lg dark:border-slate-800">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-900/40">
                                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-muted-foreground dark:border-slate-800">
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Afiliasi</th>
                                            <th className="px-4 py-3 text-right">Peran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {submission.contributors.map((contrib) => (
                                            <tr key={contrib.id} className="hover:bg-slate-50/30">
                                                <td className="px-4 py-3.5 font-medium">{contrib.name}</td>
                                                <td className="px-4 py-3.5 text-muted-foreground">{contrib.email}</td>
                                                <td className="px-4 py-3.5 text-muted-foreground">{contrib.affiliation || '—'}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    {contrib.is_corresponding ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <UserCheck className="h-3 w-3" /> Penulis Korespondensi
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Penulis Pendamping</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800">
                                <Users className="h-10 w-10 text-slate-300 mb-2" />
                                <span className="text-sm italic">Belum ada penulis pendamping yang didaftarkan.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Confirmation Checkbox & Submit ────────── */}
                <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Send className="h-5 w-5 text-blue-500" />
                            Pernyataan Konfirmasi
                        </CardTitle>
                        <CardDescription>
                            Setelah naskah dikirimkan, Anda <strong>tidak dapat lagi mengubah</strong> data berkas dan metadata naskah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 p-4">
                            <Checkbox
                                id="confirm-submission"
                                checked={confirmed}
                                onCheckedChange={(checked) => setConfirmed(checked === true)}
                                disabled={!isValid}
                            />
                            <Label htmlFor="confirm-submission" className="cursor-pointer text-sm leading-relaxed text-foreground select-none">
                                Saya bersaksi bahwa saya telah meninjau keseluruhan data pengajuan naskah ilmiah di atas. Semua informasi yang diisi serta berkas manuskrip yang dilampirkan adalah benar dan orisinal milik tim penulis.
                            </Label>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-2">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('user.profil.index'))}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Profil
                            </Button>

                            <Button
                                size="lg"
                                disabled={!canSubmit}
                                onClick={handleFinalSubmit}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-white border-none"
                            >
                                {submitting ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Mengirim…
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Kirim Naskah Ilmiah
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
