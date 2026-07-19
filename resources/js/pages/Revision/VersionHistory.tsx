import DocumentVersionList, { RevisionRoundItem } from '@/components/DocumentVersionList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type JournalAssessment } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface VersionHistoryProps {
    assessment: JournalAssessment;
    revisionRounds: RevisionRoundItem[];
}

/**
 * VersionHistory
 *
 * Halaman yang menampilkan seluruh histori versi dokumen revisi
 * (semua ronde) untuk sebuah assessment. Menggunakan komponen
 * DocumentVersionList untuk merender timeline berlabel per ronde.
 */
export default function VersionHistory({ assessment, revisionRounds }: VersionHistoryProps) {
    const journal = assessment.journal;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: route('user.assessments.index') },
        { title: journal?.title ?? `Assessment #${assessment.id}`, href: route('user.assessments.show', assessment.id) },
        { title: 'Histori Versi Dokumen', href: '#' },
    ];

    // Cari ronde terakhir yang masih pending untuk tombol upload
    const latestPendingRound = revisionRounds
        .slice()
        .reverse()
        .find((r) => r.status === 'pending');

    const uploadUrl = latestPendingRound
        ? route('user.revisions.upload', latestPendingRound.id)
        : undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                {/* ---- Header ---- */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Histori Versi Dokumen
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {journal?.title ?? `Assessment #${assessment.id}`}
                            {journal?.issn && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ISSN: {journal.issn}
                                </span>
                            )}
                        </p>
                    </div>

                    <Button
                        id="btn-kembali-assessment"
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route('user.assessments.show', assessment.id))}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Kembali
                    </Button>
                </div>

                {/* ---- Daftar versi per ronde ---- */}
                <DocumentVersionList
                    revisionRounds={revisionRounds}
                    uploadUrl={uploadUrl}
                />
            </div>
        </AppLayout>
    );
}
