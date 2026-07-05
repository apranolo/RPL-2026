import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Evaluasi', href: '/reviewer/evaluations' },
    { title: 'Detail Laporan', href: '#' },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface Proposal {
    id: number;
    judul_penelitian: string;
    user: User;
}

interface ProgressReportItem {
    id: number;
    report_date: string;
    progress_percentage: number;
    report_type: string;
}

interface Report {
    id: number;
    proposal_id: number;
    contract_id: number;
    title: string;
    content: string;
    report_type: string;
    report_date: string;
    progress_percentage: number;
    report_period: string;
    attachment_path: string | null;
    status: string;
    submitted_at: string;
    proposal: Proposal;
}

interface Props {
    report: Report;
    allReports: ProgressReportItem[];
}

function ProgressTimeline({ steps }: { steps: ProgressReportItem[] }) {
    const milestones = [0, 25, 50, 75, 100];
    const currentMax = steps.length > 0
        ? Math.max(...steps.map((s) => s.progress_percentage))
        : 0;

    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Linimasa Progres</h3>
            <div className="flex items-center justify-between">
                {milestones.map((milestone, i) => (
                    <div key={milestone} className="flex flex-col items-center flex-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                            currentMax >= milestone
                                ? 'bg-primary border-primary'
                                : 'bg-white border-slate-300'
                        }`} />
                        <span className="text-xs text-muted-foreground mt-1">{milestone}%</span>
                        {i < milestones.length - 1 && (
                            <div className={`h-0.5 w-full mt-2 ${
                                currentMax >= milestones[i + 1]
                                    ? 'bg-primary'
                                    : 'bg-slate-200'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        submitted: 'bg-amber-50 text-amber-800 border border-amber-200',
        reviewed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        pending: 'bg-slate-100 text-slate-800 border border-slate-200',
        rejected: 'bg-rose-50 text-rose-800 border border-rose-200',
    };

    const labels: Record<string, string> = {
        submitted: 'Submitted',
        reviewed: 'Direview',
        pending: 'Pending',
        rejected: 'Ditolak',
    };

    return (
        <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${styles[status] ?? 'bg-slate-100 text-slate-800'}`}>
            {labels[status] ?? status}
        </span>
    );
}

export default function EvaluationShow({ report, allReports }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Laporan Kemajuan" />
            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Detail Laporan Kemajuan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {report.proposal?.judul_penelitian ?? '-'}
                        </p>
                    </div>
                    <StatusBadge status={report.status} />
                </div>

                {/* Split Screen */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Kiri: Isi Laporan */}
                    <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
                        <h2 className="text-lg font-bold text-foreground">Isi Laporan</h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-semibold text-foreground">Dosen:</span>
                                <span className="ml-2 text-muted-foreground">
                                    {report.proposal?.user?.name ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Jenis Laporan:</span>
                                <span className="ml-2 text-muted-foreground">{report.report_type}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Tanggal Laporan:</span>
                                <span className="ml-2 text-muted-foreground">
                                    {new Date(report.report_date).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Periode:</span>
                                <span className="ml-2 text-muted-foreground">{report.report_period ?? '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Progres:</span>
                                <span className="ml-2 font-bold text-primary">{report.progress_percentage}%</span>
                            </div>
                        </div>

                        {/* Deskripsi Kegiatan */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">Deskripsi Kegiatan</h3>
                            <div
                                className="prose prose-sm max-w-none text-muted-foreground rounded-lg bg-slate-50 p-4"
                                dangerouslySetInnerHTML={{ __html: report.content ?? '-' }}
                            />
                        </div>

                        {/* Lampiran */}
                        {report.attachment_path && (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-2">Berkas Lampiran</h3>
                                
                                   <a href={`/storage/${report.attachment_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                                >
                                    Unduh Lampiran
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Kanan: Timeline + Aksi */}
                    <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
                        <h2 className="text-lg font-bold text-foreground">Riwayat Progres</h2>
                        <ProgressTimeline steps={allReports} />

                        {/* Riwayat laporan */}
                        <div className="mt-4 space-y-2">
                            {allReports.map((r) => (
                                <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                    <span className="text-muted-foreground">
                                        {new Date(r.report_date).toLocaleDateString('id-ID')}
                                    </span>
                                    <span className="font-semibold text-foreground">{r.report_type}</span>
                                    <span className="font-bold text-primary">{r.progress_percentage}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Tombol Aksi */}
                        <div className="mt-auto pt-4 border-t border-border">
                            <button
                                onClick={() => router.get(route('reviewer.evaluations.index'))}
                                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-slate-50 mb-2"
                            >
                                Kembali ke Daftar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}