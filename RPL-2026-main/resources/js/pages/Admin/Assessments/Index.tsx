import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';

/**
 * Assessments Monitoring Index Page (Super Admin)
 *
 * @description Monitor all journal assessments across all universities
 * @route GET /admin/assessments
 * @features View and monitor assessments system-wide - Currently under development
 */
export default function AssessmentsIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin.assessments.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assessment Monitoring" />

            <UnderConstruction
                title="Assessment Monitoring"
                description="Monitor dan kelola penilaian jurnal dari seluruh universitas."
                icon={ClipboardCheck}
                features={[
                    'Lihat semua assessment yang telah disubmit',
                    'Filter berdasarkan universitas',
                    'Analisis dan laporan assessment',
                    'Export data penilaian',
                ]}
            />
        </AppLayout>
    );
}
