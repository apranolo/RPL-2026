import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookType } from 'lucide-react';

/**
 * Data Master Index Page (Super Admin)
 *
 * @description Master data management page for scientific fields and reference data
 * @route GET /admin/data-master
 * @features Bidang Ilmu management - Currently under development
 */
export default function DataMasterIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: route('admin.data-master.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Master" />

            <UnderConstruction
                title="Data Master"
                description="Kelola data master untuk bidang ilmu dan data referensi lainnya."
                icon={BookType}
                features={['Manajemen Bidang Ilmu', 'Import/Export data', 'Kategori dan klasifikasi ilmu']}
            />
        </AppLayout>
    );
}
