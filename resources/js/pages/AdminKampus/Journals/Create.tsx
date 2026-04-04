/**
 * JournalsCreate Component for Admin Kampus
 *
 * @description
 * A form page allowing Admin Kampus to register a new journal into the system.
 * Includes user assignment dropdown to select the journal owner.
 *
 * @route POST /admin-kampus/journals
 */
import JournalForm from '@/components/JournalForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface UniversityUser {
    id: number;
    name: string;
    email: string;
}

interface Props {
    scientificFields: Array<{
        id: number;
        name: string;
    }>;
    sintaRankOptions: Record<string, string>;
    indexationOptions: Array<{
        value: string;
        label: string;
    }>;
    universityUsers: UniversityUser[];
}

export default function JournalsCreate({ scientificFields, sintaRankOptions, indexationOptions, universityUsers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin-kampus/dashboard' },
        { title: 'Journals', href: route('admin-kampus.journals.index') },
        { title: 'Create', href: route('admin-kampus.journals.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Journal" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Journals Management
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Register New Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Enter the details of the journal to register</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <JournalForm
                            submitUrl={route('admin-kampus.journals.store')}
                            cancelUrl={route('admin-kampus.journals.index')}
                            scientificFields={scientificFields}
                            sintaRankOptions={sintaRankOptions}
                            indexationOptions={indexationOptions}
                            universityUsers={universityUsers}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
