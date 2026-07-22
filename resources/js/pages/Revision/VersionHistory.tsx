import DocumentVersionList, { RevisionRoundItem } from '@/components/DocumentVersionList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipe lokal — subset Submission dari Modul 2 Kelas B
// ---------------------------------------------------------------------------

interface SubmissionItem {
    id: number;
    title: string | null;
    author_id: number;
    journal?: { name: string };
}

interface VersionHistoryProps extends PageProps {
    submission: SubmissionItem;
    revisionRounds: RevisionRoundItem[];
}

// ---------------------------------------------------------------------------
// Komponen utama: VersionHistory
// ---------------------------------------------------------------------------

/**
 * VersionHistory
 *
 * Halaman histori semua versi berkas naskah proposal riset
 * yang dikirim Author di setiap ronde revisi.
 *
 * Data: GET /revision/history/{submission} → RevisionController@versionHistory
 * Komponen: DocumentVersionList (berlabel per ronde, dengan tombol unduh)
 */
export default function VersionHistory({ submission, revisionRounds }: VersionHistoryProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',   href: '/dashboard' },
        { title: 'Submission',  href: '/submissions' },
        { title: submission.title ?? `Submission #${submission.id}`, href: `/submissions/${submission.id}` },
        { title: 'Riwayat Versi Naskah', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Versi Naskah" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                {/* ---- Header ---- */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Riwayat Versi Naskah
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {submission.title ?? `Submission #${submission.id}`}
                            {submission.journal?.name && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    &bull; {submission.journal.name}
                                </span>
                            )}
                        </p>
                    </div>

                    <Button
                        id="btn-kembali-submission"
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(`/submissions/${submission.id}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Kembali
                    </Button>
                </div>

                {/* ---- Timeline versi per ronde (DocumentVersionList) ---- */}
                <DocumentVersionList
                    revisionRounds={revisionRounds}
                />
            </div>
        </AppLayout>
    );
}
