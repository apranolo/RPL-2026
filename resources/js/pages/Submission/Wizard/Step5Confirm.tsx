/**
 * Wizard Step 5 — Confirm & Submit
 *
 * @description Summary page showing all data from Steps 1-4.
 *              The user reviews everything and clicks "Submit" to finalize.
 * @route GET /user/submission-wizard/{assessment}/confirm
 */
import WizardProgressBar, { type WizardStep } from '@/components/WizardProgressBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { AssessmentJournalMetadata } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle,
    FileText,
    Send,
    Shield,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

// ─── Type Definitions ───────────────────────────────────────────────

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
    url?: string;
    university?: { id: number; name: string; short_name?: string };
    scientific_field?: { id: number; name: string };
}

interface EvaluationIndicator {
    id: number;
    code: string;
    category: string;
    question: string;
    description: string | null;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
}

interface Response {
    id: number;
    evaluation_indicator: EvaluationIndicator;
    answer_boolean: boolean | null;
    answer_scale: number | null;
    answer_text: string | null;
    score: number;
    notes: string | null;
    attachments?: Array<{ id: number; original_filename: string }>;
}

interface AssessmentIssue {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: string;
}

interface Assessment {
    id: number;
    journal: Journal;
    assessment_date: string;
    period: string | null;
    notes: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    kategori_diusulkan?: string | null;
    jumlah_editor?: number | null;
    jumlah_reviewer?: number | null;
    jumlah_author?: number | null;
    jumlah_institusi_editor?: number | null;
    jumlah_institusi_reviewer?: number | null;
    jumlah_institusi_author?: number | null;
    journalMetadata?: AssessmentJournalMetadata[];
    responses?: Response[];
    issues?: AssessmentIssue[];
    total_score?: number;
    max_score?: number;
    percentage?: number;
    created_at: string;
}

interface WizardStatusItem {
    label: string;
    complete: boolean;
    description: string;
}

interface Props {
    assessment: Assessment;
    responsesByCategory: Record<string, Response[]>;
    completionPercentage: number;
    totalIndicators: number;
    answeredIndicators: number;
    wizardStatus: Record<string, WizardStatusItem>;
}

// ─── Month Helper ───────────────────────────────────────────────────

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ─── Category label helpers ─────────────────────────────────────────

const ISSUE_CATEGORY_LABELS: Record<string, string> = {
    editorial: 'Editorial',
    technical: 'Teknis',
    content_quality: 'Kualitas Konten',
    management: 'Manajemen',
};

const ISSUE_PRIORITY_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    high: { label: 'Tinggi', variant: 'destructive' },
    medium: { label: 'Sedang', variant: 'default' },
    low: { label: 'Rendah', variant: 'secondary' },
};

// ─── Component ──────────────────────────────────────────────────────

export default function Step5Confirm({
    assessment,
    responsesByCategory,
    completionPercentage,
    totalIndicators,
    answeredIndicators,
    wizardStatus,
}: Props) {
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Convert wizardStatus to WizardStep array for the progress bar
    const wizardSteps: WizardStep[] = Object.values(wizardStatus).map((s) => ({
        label: s.label,
        description: s.description,
        complete: s.complete,
    }));

    const allStepsComplete = Object.entries(wizardStatus)
        .filter(([key]) => key !== 'step5')
        .every(([, s]) => s.complete);

    const canSubmit = allStepsComplete && confirmed && !submitting;

    const handleFinalSubmit = () => {
        if (!canSubmit) return;
        setSubmitting(true);

        router.post(
            route('user.submission-wizard.final-submit', assessment.id),
            { confirm_submission: true },
            {
                preserveScroll: true,
                onError: () => setSubmitting(false),
            },
        );
    };

    // ─── Render Helpers ─────────────────────────────────────────────

    const renderAnswer = (response: Response) => {
        const indicator = response.evaluation_indicator;

        if (indicator.answer_type === 'boolean') {
            return response.answer_boolean ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" /> Ya
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
                    <XCircle className="h-4 w-4" /> Tidak
                </span>
            );
        }

        if (indicator.answer_type === 'scale') {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{response.answer_scale}/5</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div
                                key={n}
                                className={`h-2.5 w-2.5 rounded-full ${
                                    n <= (response.answer_scale || 0)
                                        ? 'bg-blue-500'
                                        : 'bg-muted-foreground/20'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <p className="max-w-md truncate text-sm text-muted-foreground">
                {response.answer_text || '—'}
            </p>
        );
    };

    // ─── JSX ────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title="Konfirmasi Pengajuan — Wizard Step 5" />

            <div className="mx-auto max-w-5xl space-y-8 pb-12">
                {/* ── Page Header ───────────────────────────── */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-3"
                        onClick={() => router.visit(route('user.assessments.edit', assessment.id))}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Edit
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Konfirmasi &amp; Kirim Pengajuan</h1>
                    <p className="mt-1 text-muted-foreground">
                        Periksa seluruh data Anda sebelum mengirimkan assessment.
                    </p>
                </div>

                {/* ── Wizard Progress Bar ───────────────────── */}
                <WizardProgressBar steps={wizardSteps} currentStep={4} />

                {/* ── Completion Overview ───────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Kelengkapan Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Indikator dijawab: <span className="font-semibold text-foreground">{answeredIndicators}</span> dari{' '}
                                    <span className="font-semibold text-foreground">{totalIndicators}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-40 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{completionPercentage}%</span>
                            </div>
                        </div>

                        {!allStepsComplete && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="text-sm">
                                    Beberapa langkah belum lengkap. Harap lengkapi semua langkah sebelum mengirim.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 1 Summary: Info Dasar ────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Langkah 1 — Informasi Dasar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Jurnal
                                </dt>
                                <dd className="mt-1 text-sm font-semibold">{assessment.journal.title}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    ISSN / E-ISSN
                                </dt>
                                <dd className="mt-1 text-sm">
                                    {assessment.journal.issn}
                                    {assessment.journal.e_issn && ` / ${assessment.journal.e_issn}`}
                                </dd>
                            </div>
                            {assessment.journal.university && (
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Universitas
                                    </dt>
                                    <dd className="mt-1 text-sm">{assessment.journal.university.name}</dd>
                                </div>
                            )}
                            {assessment.journal.scientific_field && (
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Bidang Ilmu
                                    </dt>
                                    <dd className="mt-1 text-sm">{assessment.journal.scientific_field.name}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Tanggal Assessment
                                </dt>
                                <dd className="mt-1 flex items-center gap-1.5 text-sm">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    {new Date(assessment.assessment_date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </dd>
                            </div>
                            {assessment.period && (
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Periode
                                    </dt>
                                    <dd className="mt-1 text-sm">{assessment.period}</dd>
                                </div>
                            )}
                        </dl>

                        {assessment.notes && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Catatan
                                    </dt>
                                    <dd className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {assessment.notes}
                                    </dd>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 2 Summary: Kategori & Kontributor ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-violet-500" />
                            Langkah 2 — Kategori &amp; Kontributor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assessment.kategori_diusulkan && (
                            <div className="mb-4">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Kategori Diusulkan
                                </span>
                                <div className="mt-1">
                                    <Badge variant="outline" className="px-3 py-1 text-sm">
                                        {assessment.kategori_diusulkan}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {[
                                { label: 'Editor', value: assessment.jumlah_editor },
                                { label: 'Reviewer', value: assessment.jumlah_reviewer },
                                { label: 'Author', value: assessment.jumlah_author },
                                { label: 'Institusi Editor', value: assessment.jumlah_institusi_editor },
                                { label: 'Institusi Reviewer', value: assessment.jumlah_institusi_reviewer },
                                { label: 'Institusi Author', value: assessment.jumlah_institusi_author },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
                                    <div className="text-xs text-muted-foreground">{item.label}</div>
                                    <div className="text-xl font-bold">{item.value ?? '—'}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Step 3 Summary: Data Terbitan ────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-amber-500" />
                            Langkah 3 — Data Terbitan Jurnal
                        </CardTitle>
                        <CardDescription>
                            {assessment.journalMetadata?.length ?? 0} terbitan terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assessment.journalMetadata && assessment.journalMetadata.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <th className="pb-2 pr-4">Vol / No</th>
                                            <th className="pb-2 pr-4">Bulan / Tahun</th>
                                            <th className="pb-2 pr-4">Negara Editor</th>
                                            <th className="pb-2 pr-4">Inst. Editor</th>
                                            <th className="pb-2 pr-4">Negara Reviewer</th>
                                            <th className="pb-2">Inst. Reviewer</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {assessment.journalMetadata.map((m, i) => (
                                            <tr key={m.id ?? i} className="text-sm">
                                                <td className="py-2 pr-4 font-medium">
                                                    Vol. {m.volume} No. {m.number}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {MONTH_NAMES[m.month - 1]} {m.year}
                                                </td>
                                                <td className="py-2 pr-4">{m.jumlah_negara_editor}</td>
                                                <td className="py-2 pr-4">{m.jumlah_institusi_editor}</td>
                                                <td className="py-2 pr-4">{m.jumlah_negara_reviewer}</td>
                                                <td className="py-2">{m.jumlah_institusi_reviewer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm italic text-muted-foreground">Belum ada data terbitan.</p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 4 Summary: Evaluasi ─────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            Langkah 4 — Evaluasi Indikator
                        </CardTitle>
                        <CardDescription>
                            {answeredIndicators} dari {totalIndicators} indikator dijawab
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.keys(responsesByCategory).length > 0 ? (
                            Object.entries(responsesByCategory).map(([category, responses]) => (
                                <div key={category}>
                                    <h3 className="mb-2 text-sm font-semibold">{category}</h3>
                                    <div className="space-y-2">
                                        {responses.map((response, idx) => (
                                            <div
                                                key={response.id}
                                                className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-2.5"
                                            >
                                                <div className="flex min-w-0 flex-1 items-start gap-2">
                                                    <Badge variant="outline" className="shrink-0 text-[10px]">
                                                        {response.evaluation_indicator.code}
                                                    </Badge>
                                                    <p className="truncate text-sm">
                                                        {response.evaluation_indicator.question}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">{renderAnswer(response)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm italic text-muted-foreground">Belum ada jawaban evaluasi.</p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 4b: Temuan / Issues (optional) ──── */}
                {assessment.issues && assessment.issues.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Temuan / Issues
                            </CardTitle>
                            <CardDescription>
                                {assessment.issues.length} temuan tercatat
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {assessment.issues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="rounded-lg border bg-muted/20 p-4"
                                    >
                                        <div className="mb-1 flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">{issue.title}</h4>
                                            <Badge variant={ISSUE_PRIORITY_LABELS[issue.priority]?.variant ?? 'outline'}>
                                                {ISSUE_PRIORITY_LABELS[issue.priority]?.label ?? issue.priority}
                                            </Badge>
                                            <Badge variant="outline">
                                                {ISSUE_CATEGORY_LABELS[issue.category] ?? issue.category}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Confirmation Checkbox & Submit ────────── */}
                <Card className="border-2 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Send className="h-5 w-5 text-blue-500" />
                            Konfirmasi Pengajuan
                        </CardTitle>
                        <CardDescription>
                            Setelah dikirim, assessment <strong>tidak dapat diedit</strong> lagi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                            <Checkbox
                                id="confirm-submission"
                                checked={confirmed}
                                onCheckedChange={(checked) => setConfirmed(checked === true)}
                                disabled={!allStepsComplete}
                            />
                            <Label htmlFor="confirm-submission" className="cursor-pointer text-sm leading-relaxed">
                                Saya telah memeriksa seluruh data di atas dan menyatakan bahwa informasi yang saya
                                berikan adalah benar. Saya memahami bahwa assessment yang sudah dikirim{' '}
                                <strong>tidak dapat diubah</strong>.
                            </Label>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('user.assessments.edit', assessment.id))}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Edit
                            </Button>

                            <Button
                                size="lg"
                                disabled={!canSubmit}
                                onClick={handleFinalSubmit}
                                className="gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin"
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
                                        Kirim Assessment
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
