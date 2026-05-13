import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LifeBuoy } from 'lucide-react';

/**
 * Support Page
 *
 * @description Help and support resources for all users
 * @route GET /support
 * @features Support documentation and contact - Currently under development
 */
export default function Support() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Support', href: route('support') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support" />

            <UnderConstruction
                title="Support"
                description="Bantuan dan dukungan untuk pengguna aplikasi Jurnal MU."
                icon={LifeBuoy}
                features={['FAQ dan dokumentasi', 'Hubungi tim support', 'Tutorial penggunaan', 'Troubleshooting umum']}
            />
        </AppLayout>
    );
}
