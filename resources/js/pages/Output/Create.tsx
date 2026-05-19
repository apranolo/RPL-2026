/**
 * Output/Create Component
 *
 * Main output creation page. Users first select the output type (Jenis Luaran),
 * then the appropriate sub-form is rendered.
 *
 * @route GET /user/outputs/create
 */
import { JournalOutputForm } from '@/components/Forms/JournalOutputForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, ChevronRight, FileText, FolderOpen, Lightbulb, Scroll } from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
}

interface Props {
    outputTypes: Record<string, string>;
    journals: Journal[];
}

const typeIcons: Record<string, React.ReactNode> = {
    publikasi_jurnal: <BookOpen className="h-6 w-6" />,
    hki: <Lightbulb className="h-6 w-6" />,
    buku: <BookOpen className="h-6 w-6" />,
    prosiding: <Scroll className="h-6 w-6" />,
};

const typeDescriptions: Record<string, string> = {
    publikasi_jurnal: 'Artikel ilmiah yang dipublikasikan di jurnal nasional maupun internasional',
    hki: 'Hak Kekayaan Intelektual berupa paten, hak cipta, desain industri, dll.',
    buku: 'Buku ajar, monograf, atau buku referensi ilmiah',
    prosiding: 'Artikel yang dipresentasikan dan dipublikasikan dalam prosiding konferensi',
};

export default function OutputCreate({ outputTypes, journals }: Props) {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tambah Luaran', href: route('user.outputs.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Luaran" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Tambah Luaran
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Pilih jenis luaran yang ingin Anda tambahkan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Select Output Type */}
                    {!selectedType && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Object.entries(outputTypes).map(([key, label]) => (
                                <Card
                                    key={key}
                                    className="group cursor-pointer transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700"
                                    onClick={() => setSelectedType(key)}
                                >
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-900/40">
                                            {typeIcons[key] || <FileText className="h-6 w-6" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {label}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {typeDescriptions[key] || 'Tambahkan luaran jenis ini'}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Show the appropriate sub-form */}
                    {selectedType && (
                        <div>
                            {/* Back button */}
                            <Button
                                variant="ghost"
                                className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setSelectedType(null)}
                            >
                                ← Kembali pilih jenis luaran
                            </Button>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            {typeIcons[selectedType] || <FileText className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <CardTitle>{outputTypes[selectedType]}</CardTitle>
                                            <CardDescription>
                                                {typeDescriptions[selectedType]}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {selectedType === 'publikasi_jurnal' ? (
                                        <JournalOutputForm journals={journals} />
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                                                Segera Hadir
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                Formulir untuk jenis luaran ini sedang dalam pengembangan.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
