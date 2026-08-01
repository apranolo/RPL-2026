/**
 * ProgressShow Component
 *
 * @description
 * Displays the detail of a progress report (laporan kemajuan) including proposal info,
 * contract info, progress percentage, attachment, and evaluations from reviewers.
 *
 * @route GET /user/progress/{progressReport}
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Paperclip } from 'lucide-react';

interface Reviewer {
    id: number;
    name: string;
}

interface Evaluation {
    id: number;
    score: number | null;
    notes: string | null;
    status: string;
    evaluated_at: string | null;
    reviewer: Reviewer;
}

interface Proposal {
    id: number;
    title: string;
}

interface Contract {
    id: number;
    contract_number: string;
    title: string;
}

interface ProgressReport {
    id: number;
    title: string;
    content: string;
    report_type: 'logbook' | 'laporan_kemajuan' | 'laporan_akhir';
    report_date: string;
    progress_percentage: number;
    report_period: string;
    attachment_path: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    submitted_at: string | null;
    created_at: string;
    proposal: Proposal;
    contract: Contract | null;
    evaluations: Evaluation[];
}

interface Props {
    progressReport: ProgressReport;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    reviewed: { label: 'Reviewed', variant: 'outline' },
};

const reportTypeConfig: Record<string, string> = {
    logbook: 'Logbook',
    laporan_kemajuan: 'Laporan Kemajuan',
    laporan_akhir: 'Laporan Akhir',
};

const evaluationStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    reviewed: { label: 'Reviewed', variant: 'default' },
    revised: { label: 'Revised', variant: 'outline' },
};

export default function ProgressShow({ progressReport }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Kemajuan', href: route('user.progress.index') },
        { title: progressReport.title, href: route('user.progress.show', progressReport.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={progressReport.title} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('user.progress.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{progressReport.title}</h1>
                            <p className="text-muted-foreground">Detail laporan kemajuan penelitian</p>
                        </div>
                    </div>
                    <Badge variant={statusConfig[progressReport.status]?.variant ?? 'secondary'}>
                        {statusConfig[progressReport.status]?.label ?? progressReport.status}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Detail Laporan */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Laporan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jenis Laporan</p>
                                    <Badge variant="outline">{reportTypeConfig[progressReport.report_type] ?? progressReport.report_type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Periode</p>
                                    <p className="font-medium">{progressReport.report_period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal Pelaporan</p>
                                    <p className="font-medium">{progressReport.report_date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal Submit</p>
                                    <p className="font-medium">{progressReport.submitted_at ?? '-'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">Persentase Progres</p>
                                <div className="flex items-center gap-3">
                                    <Progress value={progressReport.progress_percentage} className="h-2 w-full max-w-md [&>div]:bg-emerald-500" />
                                    <span className="text-sm font-medium">{progressReport.progress_percentage}%</span>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">Deskripsi Kegiatan</p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{progressReport.content}</p>
                            </div>

                            {progressReport.attachment_path && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="mb-2 text-sm text-muted-foreground">Dokumen Lampiran</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/storage/${progressReport.attachment_path}`} target="_blank" rel="noopener noreferrer">
                                                <Paperclip className="mr-2 h-4 w-4" />
                                                Lihat Lampiran
                                            </a>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar: Proposal & Kontrak */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Proposal Terkait</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium">{progressReport.proposal?.title ?? '-'}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Kontrak Penelitian</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progressReport.contract ? (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">{progressReport.contract.title}</p>
                                        <p className="text-xs text-muted-foreground">No: {progressReport.contract.contract_number}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Belum terhubung dengan kontrak</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Evaluasi Reviewer */}
                <Card>
                    <CardHeader>
                        <CardTitle>Catatan Evaluasi Reviewer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {progressReport.evaluations.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Belum ada evaluasi dari reviewer</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {progressReport.evaluations.map((evaluation) => (
                                    <div key={evaluation.id} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{evaluation.reviewer?.name ?? '-'}</p>
                                                <Badge variant={evaluationStatusConfig[evaluation.status]?.variant ?? 'secondary'}>
                                                    {evaluationStatusConfig[evaluation.status]?.label ?? evaluation.status}
                                                </Badge>
                                            </div>
                                            {evaluation.score !== null && <Badge variant="outline">Skor: {evaluation.score}</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{evaluation.notes ?? 'Belum ada catatan.'}</p>
                                        {evaluation.evaluated_at && (
                                            <p className="mt-2 text-xs text-muted-foreground">Dievaluasi: {evaluation.evaluated_at}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
