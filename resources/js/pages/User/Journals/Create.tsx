/**
 * JournalsCreate Component
 *
 * @features
 * - Uses shared JournalForm for journal registration
 *
 * @route POST /user/journals
 */
import JournalForm from '@/components/JournalForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';

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
}

export default function JournalsCreate({ scientificFields, sintaRankOptions, indexationOptions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Journals', href: route('user.journals.index') },
        { title: 'Create', href: route('user.journals.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Journal" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('user.journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to My Journals
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Register New Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Enter the details of the journal you manage</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <JournalForm
                            submitUrl={route('user.journals.store')}
                            cancelUrl={route('user.journals.index')}
                            scientificFields={scientificFields}
                            sintaRankOptions={sintaRankOptions}
                            indexationOptions={indexationOptions}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
