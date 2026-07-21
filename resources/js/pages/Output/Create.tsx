import JournalForm from '@/components/Forms/JournalForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ChevronRight, FileText, FolderOpen, Lightbulb, Package, ScrollText } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface Proposal {
    id: number;
    title: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn?: string | null;
}

interface Props {
    outputTypes: Record<string, string>;
    proposals: Proposal[];
    journals: Journal[];
}

const typeIcons: Record<string, ReactNode> = {
    jurnal: <BookOpen className="h-5 w-5" />,
    buku: <BookOpen className="h-5 w-5" />,
    hki: <Lightbulb className="h-5 w-5" />,
    prosiding: <ScrollText className="h-5 w-5" />,
    produk: <Package className="h-5 w-5" />,
};

const typeDescriptions: Record<string, string> = {
    jurnal: 'Artikel ilmiah yang dipublikasikan di jurnal nasional atau internasional.',
    buku: 'Buku ajar, monograf, atau referensi ilmiah.',
    hki: 'Hak cipta, paten, desain industri, atau kekayaan intelektual lain.',
    prosiding: 'Artikel ilmiah yang terbit dalam prosiding konferensi.',
    produk: 'Produk, prototipe, atau karya teknologi hasil riset.',
};

export default function OutputCreate({ outputTypes, proposals, journals }: Props) {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Luaran', href: route('user.outputs.index') },
        { title: 'Tambah', href: route('user.outputs.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Luaran" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                <FolderOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tambah Luaran</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pilih jenis luaran dan lengkapi data penelitian.</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('user.outputs.index')}>Kembali</Link>
                        </Button>
                    </div>

                    {proposals.length === 0 && (
                        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            Anda belum memiliki proposal. Luaran riset membutuhkan proposal sebelum dapat disimpan.
                        </div>
                    )}

                    {!selectedType && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Object.entries(outputTypes).map(([key, label]) => (
                                <Card
                                    key={key}
                                    className="cursor-pointer transition hover:border-sky-300 hover:shadow-sm dark:hover:border-sky-800"
                                    onClick={() => setSelectedType(key)}
                                >
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                            {typeIcons[key] || <FileText className="h-5 w-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{label}</h2>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{typeDescriptions[key] || 'Tambahkan luaran riset.'}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {selectedType && (
                        <div className="space-y-4">
                            <Button variant="ghost" className="pl-0" onClick={() => setSelectedType(null)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Pilih jenis lain
                            </Button>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                            {typeIcons[selectedType] || <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <CardTitle>{outputTypes[selectedType]}</CardTitle>
                                            <CardDescription>{typeDescriptions[selectedType]}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {selectedType === 'jurnal' ? (
                                        <JournalForm proposals={proposals} journals={journals} />
                                    ) : (
                                        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                                            <FileText className="mx-auto h-10 w-10 text-gray-400" />
                                            <h2 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">Form belum tersedia</h2>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Jenis luaran ini belum menjadi bagian dari perbaikan saat ini.</p>
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
