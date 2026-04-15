import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';

/**
 * Reviewer Index Page (Admin Kampus)
 *
 * @description Manage reviewers for journal assessment process
 * @route GET /admin-kampus/reviewer
 * @features Reviewer management - Currently under development
 */
export default function ReviewerIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reviewer', href: route('admin-kampus.reviewer.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer" />

            <UnderConstruction
                title="Reviewer"
                description="Kelola reviewer untuk proses penilaian dan akreditasi jurnal."
                icon={UserCheck}
                features={['Manajemen data reviewer', 'Assign reviewer ke jurnal', 'Tracking proses review', 'Laporan kinerja reviewer']}
            />
        </AppLayout>
    );
}
