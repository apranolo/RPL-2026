/**
 * JournalsEdit Component
 *
 * @description
 * The editing interface for existing journals using JournalForm component.
 *
 * @route PUT /user/journals/{id}
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JournalForm, { type JournalFormData } from '@/components/JournalForm';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    scientific_field_id: number;
    sinta_rank: string;
    frequency: string;
    publisher: string;
    first_published_year: number | null;
    accreditation_start_year?: number | null;
    accreditation_end_year?: number | null;
    accreditation_sk_number?: string | null;
    accreditation_sk_date?: string | null;
    editor_in_chief?: string | null;
    email?: string | null;
    phone?: string | null;
    oai_urls?: string[] | null;
    about?: string | null;
    scope?: string | null;
    cover_image?: string | null;
    indexations?: Record<string, { url: string }> | null;
}

interface Props {
    journal: Journal;
    scientificFields: Array<{ id: number; name: string }>;
    sintaRankOptions: Record<string, string>;
    indexationOptions: Array<{ value: string; label: string }>;
}

export default function JournalsEdit({ journal, scientificFields, sintaRankOptions, indexationOptions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Journals', href: route('user.journals.index') },
        { title: 'Edit Journal', href: route('user.journals.edit', journal.id) },
    ];

    // Transform journal indexations to the format expected by JournalForm
    let formattedIndexations: Array<{ platform: string; url: string }> = [];
    if (journal.indexations) {
        formattedIndexations = Object.entries(journal.indexations).map(([platform, data]) => ({
            platform,
            url: data.url || ''
        }));
    }

    const initialData: Partial<JournalFormData> = {
        title: journal.title || '',
        issn: journal.issn || '',
        e_issn: journal.e_issn || '',
        url: journal.url || '',
        scientific_field_id: journal.scientific_field_id ? String(journal.scientific_field_id) : '',
        sinta_rank: journal.sinta_rank || 'non_sinta',
        frequency: journal.frequency || '',
        publisher: journal.publisher || '',
        first_published_year: journal.first_published_year ? String(journal.first_published_year) : '',
        accreditation_start_year: journal.accreditation_start_year ? String(journal.accreditation_start_year) : '',
        accreditation_end_year: journal.accreditation_end_year ? String(journal.accreditation_end_year) : '',
        accreditation_sk_number: journal.accreditation_sk_number || '',
        accreditation_sk_date: journal.accreditation_sk_date || '',
        editor_in_chief: journal.editor_in_chief || '',
        email: journal.email || '',
        phone: journal.phone || '',
        oai_urls: journal.oai_urls && journal.oai_urls.length > 0 ? journal.oai_urls : [''],
        about: journal.about || '',
        scope: journal.scope || '',
        indexations: formattedIndexations,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Journal: ${journal.title}`} />

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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Update the details of your journal</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <JournalForm 
                            submitUrl={route('user.journals.update', journal.id)}
                            cancelUrl={route('user.journals.index')}
                            scientificFields={scientificFields}
                            sintaRankOptions={sintaRankOptions}
                            indexationOptions={indexationOptions}
                            initialData={initialData}
                            isEdit={true}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
