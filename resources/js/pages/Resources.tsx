import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Box } from 'lucide-react';

/**
 * Resources Page
 *
 * @description Learning resources and materials for all users
 * @route GET /resources
 * @features Educational resources and downloads - Currently under development
 */
export default function Resources() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Resources', href: route('resources') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resources" />

            <UnderConstruction
                title="Resources"
                description="Sumber daya dan materi pembelajaran untuk pengelolaan jurnal."
                icon={Box}
                features={['Download template dan formulir', 'Panduan best practices', 'Video tutorial', 'Regulasi dan kebijakan']}
            />
        </AppLayout>
    );
}
